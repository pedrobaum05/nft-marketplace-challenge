
import { api } from "./api"

import type {
  CartQuote,
  CreateQuoteRequest,
} from "@/types"

export async function createQuote(
  input: CreateQuoteRequest = {},
): Promise<CartQuote> {
  const { data } = await api.post<CartQuote>(
    "/checkout/quote",
    input,
  )

  return data
}

export async function getQuote(
  quoteId: string,
): Promise<CartQuote> {
  if (!quoteId.trim()) {
    throw new Error("O identificador da cotação é obrigatório.")
  }

  const { data } = await api.get<CartQuote>(
    `/checkout/quote/${encodeURIComponent(quoteId)}`,
  )

  return data
}
