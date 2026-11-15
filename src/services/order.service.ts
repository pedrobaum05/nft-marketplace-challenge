
import { api } from "./api"

import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatus,
} from "@/types"

export async function createOrder(
  input: CreateOrderRequest,
  idempotencyKey: string,
): Promise<CreateOrderResponse> {
  if (!idempotencyKey.trim()) {
    throw new Error("A chave de idempotência é obrigatória.")
  }

  const { data } = await api.post<CreateOrderResponse>(
    "/orders",
    input,
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    },
  )

  return data
}

export async function getOrder(
  orderId: string,
): Promise<CreateOrderResponse> {
  if (!orderId.trim()) {
    throw new Error("O identificador do pedido é obrigatório.")
  }

  const { data } = await api.get<CreateOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}`,
  )

  return data
}

export async function updateOrderStatus(
  orderId: string,
  status: Exclude<OrderStatus, "pending">,
): Promise<CreateOrderResponse> {
  if (!orderId.trim()) {
    throw new Error("O identificador do pedido é obrigatório.")
  }

  const { data } = await api.patch<CreateOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}/status`,
    { status },
  )

  return data
}
