
import { http, HttpResponse } from "msw"

import type { Cart, CartItem, NFT } from "@/types"
import { nfts } from "../data/nfts"
import { getActiveSession } from "./auth"

const CARTS_STORAGE_KEY = "nft-marketplace:mock-carts"
const GUEST_CART_STORAGE_KEY = "nft-marketplace:guest-cart"

interface StoredCart {
  userId: string
  items: CartItem[]
  updatedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value) || !isRecord(value.nft)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    Number.isSafeInteger(value.quantity) &&
    Number(value.quantity) > 0 &&
    typeof value.nft.id === "string" &&
    typeof value.nft.price === "string"
  )
}

function isStoredCart(value: unknown): value is StoredCart {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false
  }

  return (
    typeof value.userId === "string" &&
    typeof value.updatedAt === "string" &&
    value.items.every(isCartItem)
  )
}

function readCarts(): StoredCart[] {
  try {
    const stored = localStorage.getItem(CARTS_STORAGE_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoredCart)
  } catch {
    return []
  }
}

function saveCarts(carts: StoredCart[]): void {
  localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(carts))
}

function readGuestCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(isCartItem)
  } catch {
    return []
  }
}

function saveGuestCart(items: CartItem[]): void {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items))
}

function getUserCart(userId: string): StoredCart {
  const carts = readCarts()
  const existingCart = carts.find((cart) => cart.userId === userId)

  if (existingCart) return existingCart

  const newCart: StoredCart = {
    userId,
    items: [],
    updatedAt: new Date().toISOString(),
  }

  saveCarts([...carts, newCart])

  return newCart
}

function saveUserCart(cart: StoredCart): void {
  const carts = readCarts()
  const existingIndex = carts.findIndex(
    (item) => item.userId === cart.userId,
  )

  if (existingIndex === -1) {
    saveCarts([...carts, cart])
    return
  }

  const updatedCarts = [...carts]
  updatedCarts[existingIndex] = cart

  saveCarts(updatedCarts)
}

function toCart(cart: StoredCart): Cart {
  return {
    id: `cart-${cart.userId}`,
    items: cart.items,
    updatedAt: cart.updatedAt,
  }
}

function toGuestCart(items: CartItem[]): Cart {
  return {
    id: "cart-guest",
    items,
    updatedAt: new Date().toISOString(),
  }
}

function findAvailableNFT(nftId: string): NFT | undefined {
  return nfts.find(
    (nft) => nft.id === nftId && nft.status === "available",
  )
}

function createCartItem(nft: NFT): CartItem {
  return {
    id: `cart-item-${nft.id}`,
    nft,
    quantity: 1,
  }
}

function mergeGuestCartIntoUser(userId: string): StoredCart {
  const userCart = getUserCart(userId)
  const guestItems = readGuestCart()

  if (guestItems.length === 0) {
    return userCart
  }

  const mergedItems = [...userCart.items]

  for (const guestItem of guestItems) {
    const existingIndex = mergedItems.findIndex(
      (item) => item.nft.id === guestItem.nft.id,
    )

    if (existingIndex === -1) {
      mergedItems.push(guestItem)
      continue
    }

    const existingItem = mergedItems[existingIndex]
    const totalQuantity = existingItem.quantity + guestItem.quantity

    if (Number.isSafeInteger(totalQuantity)) {
      mergedItems[existingIndex] = {
        ...existingItem,
        quantity: totalQuantity,
      }
    }
  }

  const updatedCart: StoredCart = {
    ...userCart,
    items: mergedItems,
    updatedAt: new Date().toISOString(),
  }

  saveUserCart(updatedCart)
  localStorage.removeItem(GUEST_CART_STORAGE_KEY)

  return updatedCart
}

function isValidQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  )
}

export const cartHandlers = [
  http.get("/api/cart", () => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(toGuestCart(readGuestCart()))
    }

    const cart = mergeGuestCartIntoUser(session.user.id)

    return HttpResponse.json(toCart(cart))
  }),

  http.post("/api/cart/items", async ({ request }) => {
    const body: unknown = await request.json()

    if (!isRecord(body) || typeof body.nftId !== "string") {
      return HttpResponse.json(
        { message: "Informe um NFT válido." },
        { status: 400 },
      )
    }

    const nft = findAvailableNFT(body.nftId)

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado ou indisponível." },
        { status: 404 },
      )
    }

    const session = getActiveSession()
    const items = session
      ? getUserCart(session.user.id).items
      : readGuestCart()

    if (items.some((item) => item.nft.id === nft.id)) {
      return HttpResponse.json(
        { message: "Este NFT já está no carrinho." },
        { status: 409 },
      )
    }

    const updatedItems = [...items, createCartItem(nft)]

    if (session) {
      const cart = getUserCart(session.user.id)

      const updatedCart: StoredCart = {
        ...cart,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      }

      saveUserCart(updatedCart)

      return HttpResponse.json(toCart(updatedCart), { status: 201 })
    }

    saveGuestCart(updatedItems)

    return HttpResponse.json(toGuestCart(updatedItems), { status: 201 })
  }),

  http.patch("/api/cart/items/:itemId", async ({ request, params }) => {
    const body: unknown = await request.json()

    if (!isRecord(body) || !isValidQuantity(body.quantity)) {
      return HttpResponse.json(
        { message: "Informe uma quantidade inteira maior que zero." },
        { status: 400 },
      )
    }

    const session = getActiveSession()
    const items = session
      ? getUserCart(session.user.id).items
      : readGuestCart()

    const itemId = String(params.itemId)

    if (!items.some((item) => item.id === itemId)) {
      return HttpResponse.json(
        { message: "Item não encontrado no carrinho." },
        { status: 404 },
      )
    }

    const updatedItems = items.map((item) =>
      item.id === itemId
        ? { ...item, quantity: body.quantity as number }
        : item,
    )

    if (session) {
      const cart = getUserCart(session.user.id)

      const updatedCart: StoredCart = {
        ...cart,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      }

      saveUserCart(updatedCart)

      return HttpResponse.json(toCart(updatedCart))
    }

    saveGuestCart(updatedItems)

    return HttpResponse.json(toGuestCart(updatedItems))
  }),

  http.delete("/api/cart/items/:itemId", ({ params }) => {
    const session = getActiveSession()
    const items = session
      ? getUserCart(session.user.id).items
      : readGuestCart()

    const itemId = String(params.itemId)
    const updatedItems = items.filter((item) => item.id !== itemId)

    if (session) {
      const cart = getUserCart(session.user.id)

      const updatedCart: StoredCart = {
        ...cart,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      }

      saveUserCart(updatedCart)

      return HttpResponse.json(toCart(updatedCart))
    }

    saveGuestCart(updatedItems)

    return HttpResponse.json(toGuestCart(updatedItems))
  }),

  http.delete("/api/cart", () => {
    const session = getActiveSession()

    if (session) {
      const cart: StoredCart = {
        ...getUserCart(session.user.id),
        items: [],
        updatedAt: new Date().toISOString(),
      }

      saveUserCart(cart)

      return HttpResponse.json(toCart(cart))
    }

    saveGuestCart([])

    return HttpResponse.json(toGuestCart([]))
  }),
]

export function getCurrentCart(): Cart {
  const session = getActiveSession()

  if (!session) {
    return toGuestCart(readGuestCart())
  }

  const cart = mergeGuestCartIntoUser(session.user.id)

  return toCart(cart)
}
