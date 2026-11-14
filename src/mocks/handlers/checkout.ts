
import { http, HttpResponse } from "msw"
import Decimal from "decimal.js"

import type {
  CartItem,
  CartQuote,
  Coupon,
  CreateQuoteRequest,
} from "@/types"
import { getCurrentCart } from "./cart"
import { getActiveSession } from "./auth"
import { nfts } from "../data/nfts"

const QUOTES_STORAGE_KEY = "nft-marketplace:mock-quotes"
const QUOTE_VALIDITY_MS = 5 * 60 * 1000
const NETWORK_FEE = "0.005"

interface StoredQuote {
  quote: CartQuote
  userId: string
  createdAt: string
}

const availableCoupons: Coupon[] = [
  {
    code: "WELCOME10",
    discountPercentage: "10",
    description: "10% de desconto na compra.",
  },
  {
    code: "JUNGLE15",
    discountPercentage: "15",
    description: "15% de desconto na compra.",
  },
]

const expiredCouponCodes = ["EXPIRED10"]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readQuotes(): StoredQuote[] {
  try {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is StoredQuote => {
      if (!isRecord(item) || !isRecord(item.quote)) {
        return false
      }

      return (
        typeof item.userId === "string" &&
        typeof item.createdAt === "string" &&
        typeof item.quote.quoteId === "string"
      )
    })
  } catch {
    return []
  }
}

function saveQuote(storedQuote: StoredQuote): void {
  const quotes = readQuotes()

  const updatedQuotes = [
    ...quotes.filter(
      (item) => item.quote.quoteId !== storedQuote.quote.quoteId,
    ),
    storedQuote,
  ]

  localStorage.setItem(
    QUOTES_STORAGE_KEY,
    JSON.stringify(updatedQuotes),
  )
}

export function getStoredQuote(
  quoteId: string,
): StoredQuote | undefined {
  return readQuotes().find(
    (item) => item.quote.quoteId === quoteId,
  )
}

function createQuoteId(): string {
  return `quote-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function refreshCartItems(items: CartItem[]): CartItem[] | null {
  const updatedItems: CartItem[] = []

  for (const item of items) {
    const currentNFT = nfts.find(
      (nft) => nft.id === item.nft.id,
    )

    if (
      !currentNFT ||
      currentNFT.status !== "available" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return null
    }

    updatedItems.push({
      ...item,
      nft: currentNFT,
    })
  }

  return updatedItems
}

function calculateSubtotal(items: CartItem[]): Decimal {
  return items.reduce((subtotal, item) => {
    const price = new Decimal(item.nft.price)

    return subtotal.plus(price.mul(item.quantity))
  }, new Decimal(0))
}

function calculateDiscount(
  subtotal: Decimal,
  coupon: Coupon | null,
): Decimal {
  if (!coupon) return new Decimal(0)

  const percentage = new Decimal(coupon.discountPercentage)

  if (
    !percentage.isFinite() ||
    percentage.isNegative() ||
    percentage.greaterThan(100)
  ) {
    throw new Error("Percentual de desconto inválido.")
  }

  return subtotal.mul(percentage).div(100)
}

function isValidQuoteRequest(
  value: unknown,
): value is CreateQuoteRequest {
  return (
    isRecord(value) &&
    (
      value.couponCode === undefined ||
      typeof value.couponCode === "string"
    )
  )
}

export const checkoutHandlers = [
  http.post("/api/checkout/quote", async ({ request }) => {
    const body: unknown = await request.json()

    if (!isValidQuoteRequest(body)) {
      return HttpResponse.json(
        { message: "Dados da cotação inválidos." },
        { status: 400 },
      )
    }

    const cart = getCurrentCart()

    if (cart.items.length === 0) {
      return HttpResponse.json(
        { message: "O carrinho está vazio." },
        { status: 400 },
      )
    }

    const items = refreshCartItems(cart.items)

    if (!items) {
      return HttpResponse.json(
        {
          message:
            "Um ou mais NFTs estão indisponíveis. Atualize seu carrinho.",
        },
        { status: 409 },
      )
    }

    const couponCode = body.couponCode?.trim().toUpperCase()
    let coupon: Coupon | null = null

    if (couponCode) {
      if (expiredCouponCodes.includes(couponCode)) {
        return HttpResponse.json(
          { message: "Este cupom está expirado." },
          { status: 422 },
        )
      }

      coupon =
        availableCoupons.find(
          (item) => item.code === couponCode,
        ) ?? null

      if (!coupon) {
        return HttpResponse.json(
          { message: "Cupom inválido." },
          { status: 422 },
        )
      }
    }

    try {
      const subtotal = calculateSubtotal(items)
      const discount = calculateDiscount(subtotal, coupon)
      const networkFee = new Decimal(NETWORK_FEE)
      const total = subtotal.minus(discount).plus(networkFee)

      if (total.isNegative()) {
        return HttpResponse.json(
          { message: "O valor total da cotação é inválido." },
          { status: 400 },
        )
      }

      const expiresAt = new Date(
        Date.now() + QUOTE_VALIDITY_MS,
      ).toISOString()

      const quote: CartQuote = {
        quoteId: createQuoteId(),
        cartId: cart.id,
        items,
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        networkFee: networkFee.toString(),
        total: total.toString(),
        coupon,
        expiresAt,
      }

      const session = getActiveSession()

      saveQuote({
        quote,
        userId: session?.user.id ?? "guest",
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json(quote)
    } catch {
      return HttpResponse.json(
        { message: "Não foi possível calcular a cotação." },
        { status: 400 },
      )
    }
  }),
]
