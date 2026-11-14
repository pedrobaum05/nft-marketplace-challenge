
import { api } from "./api"

import type { Cart } from "@/types"

interface AddCartItemInput {
  nftId: string
}

interface UpdateCartItemInput {
  itemId: string
  quantity: number
}

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Cart>("/cart")

  return data
}

export async function addCartItem(
  input: AddCartItemInput,
): Promise<Cart> {
  const { data } = await api.post<Cart>("/cart/items", input)

  return data
}

export async function updateCartItem(
  input: UpdateCartItemInput,
): Promise<Cart> {
  const { data } = await api.patch<Cart>(
    `/cart/items/${input.itemId}`,
    { quantity: input.quantity },
  )

  return data
}

export async function removeCartItem(
  itemId: string,
): Promise<Cart> {
  const { data } = await api.delete<Cart>(
    `/cart/items/${itemId}`,
  )

  return data
}

export async function clearCart(): Promise<Cart> {
  const { data } = await api.delete<Cart>("/cart")

  return data
}
