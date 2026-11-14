
import { api } from "./api"
import type { CartQuote, CreateQuoteRequest } from "@/types"

export async function createQuote(
  input: CreateQuoteRequest = {},
): Promise<CartQuote> {
  const { data } = await api.post<CartQuote>(
    "/checkout/quote",
    input,
  )

  return data
}
