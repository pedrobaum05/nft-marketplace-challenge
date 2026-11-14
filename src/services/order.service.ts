
import { api } from "./api"

import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/types"

export async function createOrder(
  input: CreateOrderRequest,
  idempotencyKey: string,
): Promise<CreateOrderResponse> {
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
  const { data } = await api.get<CreateOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}`,
  )

  return data
}
