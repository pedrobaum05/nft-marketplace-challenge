
import { http, HttpResponse } from "msw"

import type {
  CreateOrderRequest,
  Order,
  OrderStatus,
  Wallet,
} from "@/types"

import { getActiveSession } from "./auth"
import { getStoredQuote } from "./checkout"

const ORDERS_STORAGE_KEY = "nft-marketplace:mock-orders"
const WALLETS_STORAGE_KEY = "nft-marketplace:mock-wallets"

interface StoredWallet extends Wallet {
  userId: string
}

interface StoredOrder {
  order: Order
  idempotencyKey: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isStoredWallet(value: unknown): value is StoredWallet {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.address === "string" &&
    typeof value.name === "string" &&
    typeof value.balance === "string" &&
    (value.status === "connected" || value.status === "disconnected") &&
    typeof value.createdAt === "string"
  )
}

function isStoredOrder(value: unknown): value is StoredOrder {
  if (!isRecord(value) || !isRecord(value.order)) {
    return false
  }

  return (
    typeof value.idempotencyKey === "string" &&
    typeof value.order.id === "string" &&
    typeof value.order.userId === "string" &&
    typeof value.order.status === "string"
  )
}

function readWallets(): StoredWallet[] {
  try {
    const stored = localStorage.getItem(WALLETS_STORAGE_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoredWallet)
  } catch {
    return []
  }
}

function readOrders(): StoredOrder[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoredOrder)
  } catch {
    return []
  }
}

function saveOrders(orders: StoredOrder[]): void {
  localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify(orders),
  )
}

function isValidOrderRequest(
  value: unknown,
): value is CreateOrderRequest {
  return (
    isRecord(value) &&
    typeof value.quoteId === "string" &&
    value.quoteId.trim().length > 0 &&
    typeof value.walletId === "string" &&
    value.walletId.trim().length > 0
  )
}

function createOrderId(): string {
  return `order-${crypto.randomUUID()}`
}

function isOrderStatus(value: string | null): value is OrderStatus {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "declined"
  )
}

export const orderHandlers = [
  http.post("/api/orders", async ({ request }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const idempotencyKey = request.headers.get("Idempotency-Key")

    if (!idempotencyKey?.trim()) {
      return HttpResponse.json(
        { message: "A chave de idempotência é obrigatória." },
        { status: 400 },
      )
    }

    const existingOrder = readOrders().find(
      (item) =>
        item.idempotencyKey === idempotencyKey &&
        item.order.userId === session.user.id,
    )

    if (existingOrder) {
      return HttpResponse.json({
        order: existingOrder.order,
      })
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return HttpResponse.json(
        { message: "Corpo da requisição inválido." },
        { status: 400 },
      )
    }

    if (!isValidOrderRequest(body)) {
      return HttpResponse.json(
        { message: "Dados do pedido inválidos." },
        { status: 400 },
      )
    }

    const storedQuote = getStoredQuote(body.quoteId)

    if (!storedQuote || storedQuote.userId !== session.user.id) {
      return HttpResponse.json(
        { message: "Cotação não encontrada." },
        { status: 404 },
      )
    }

    const quote = storedQuote.quote

    if (new Date(quote.expiresAt).getTime() <= Date.now()) {
      return HttpResponse.json(
        { message: "A cotação expirou. Gere uma nova cotação." },
        { status: 409 },
      )
    }

    const wallet = readWallets().find(
      (item) =>
        item.id === body.walletId &&
        item.userId === session.user.id,
    )

    if (!wallet) {
      return HttpResponse.json(
        { message: "Carteira não encontrada." },
        { status: 404 },
      )
    }

    if (wallet.status !== "connected") {
      return HttpResponse.json(
        { message: "A carteira selecionada está desconectada." },
        { status: 409 },
      )
    }

    const requestedStatus = request.headers.get(
      "x-mock-order-status",
    )

    const status: OrderStatus = isOrderStatus(requestedStatus)
      ? requestedStatus
      : "pending"

    const order: Order = {
      id: createOrderId(),
      userId: session.user.id,
      quoteId: quote.quoteId,
      walletId: wallet.id,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      networkFee: quote.networkFee,
      total: quote.total,
      status,
      createdAt: new Date().toISOString(),
    }

    saveOrders([
      ...readOrders(),
      {
        order,
        idempotencyKey,
      },
    ])

    return HttpResponse.json(
      { order },
      { status: 201 },
    )
  }),

  http.get("/api/orders/:orderId", ({ params }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const storedOrder = readOrders().find(
      (item) =>
        item.order.id === String(params.orderId) &&
        item.order.userId === session.user.id,
    )

    if (!storedOrder) {
      return HttpResponse.json(
        { message: "Pedido não encontrado." },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      order: storedOrder.order,
    })
  }),
]
