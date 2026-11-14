
import type { DecimalString, ID } from "./common"
import type { NFT } from "./nft"

export interface CartItem {
  id: ID
  nft: NFT
  quantity: number
}

export interface Cart {
  id: ID
  items: CartItem[]
  updatedAt: string
}

export interface Coupon {
  code: string
  discountPercentage: DecimalString
  description: string
}

export interface CreateQuoteRequest {
  couponCode?: string
}

export interface CartQuote {
  quoteId: ID
  cartId: ID
  items: CartItem[]
  subtotal: DecimalString
  discount: DecimalString
  networkFee: DecimalString
  total: DecimalString
  coupon: Coupon | null
  expiresAt: string
}

export type OrderStatus = "pending" | "confirmed" | "declined"

export interface Order {
  id: ID
  userId: ID
  quoteId: ID
  walletId: ID
  items: CartItem[]
  subtotal: DecimalString
  discount: DecimalString
  networkFee: DecimalString
  total: DecimalString
  status: OrderStatus
  createdAt: string
}

export interface CreateOrderRequest {
  quoteId: ID
  walletId: ID
}

export interface CreateOrderResponse {
  order: Order
}
