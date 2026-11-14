
import { http, HttpResponse } from "msw"

import { getActiveSession } from "./auth"
import { nfts } from "../data/nfts"

interface StoredFavorite {
  userId: string
  nftId: string
}

const FAVORITES_STORAGE_KEY = "nft-marketplace:mock-favorites"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isStoredFavorite(value: unknown): value is StoredFavorite {
  return (
    isRecord(value) &&
    typeof value.userId === "string" &&
    typeof value.nftId === "string"
  )
}

function readFavorites(): StoredFavorite[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isStoredFavorite)
  } catch {
    return []
  }
}

function saveFavorites(favorites: StoredFavorite[]): void {
  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(favorites),
  )
}

export const favoriteHandlers = [
  http.get("/api/favorites", () => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const nftIds = readFavorites()
      .filter((favorite) => favorite.userId === session.user.id)
      .map((favorite) => favorite.nftId)

    return HttpResponse.json({ nftIds })
  }),

  http.post("/api/favorites/:nftId", ({ params }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const nftId = String(params.nftId)

    const nftExists = nfts.some((nft) => nft.id === nftId)

    if (!nftExists) {
      return HttpResponse.json(
        { message: "NFT não encontrado." },
        { status: 404 },
      )
    }

    const favorites = readFavorites()

    const alreadyFavorite = favorites.some(
      (favorite) =>
        favorite.userId === session.user.id &&
        favorite.nftId === nftId,
    )

    if (alreadyFavorite) {
      return HttpResponse.json(
        { message: "NFT já está nos favoritos." },
        { status: 409 },
      )
    }

    const newFavorite: StoredFavorite = {
      userId: session.user.id,
      nftId,
    }

    const updatedFavorites = [...favorites, newFavorite]

    saveFavorites(updatedFavorites)

    return HttpResponse.json(
      { success: true, nftId },
      { status: 201 },
    )
  }),

  http.delete("/api/favorites/:nftId", ({ params }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const nftId = String(params.nftId)
    const favorites = readFavorites()

    const updatedFavorites = favorites.filter(
      (favorite) =>
        favorite.userId !== session.user.id ||
        favorite.nftId !== nftId,
    )

    saveFavorites(updatedFavorites)

    return HttpResponse.json({ success: true, nftId })
  }),
]
