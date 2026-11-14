
import { http, HttpResponse } from "msw"
import Decimal from "decimal.js"

import type { NFT, NFTFilters } from "@/types"
import { nfts } from "../data/nfts"
import { authHandlers } from "./auth"
import { walletHandlers } from "./wallets"
import { favoriteHandlers } from "./favorites"
import { cartHandlers } from "./cart"
import { checkoutHandlers } from "./checkout"

export const handlers = [
  ...authHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
  ...walletHandlers,
  ...favoriteHandlers,

  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url)

    const filters: NFTFilters = {
      search: url.searchParams.get("search") ?? undefined,
      collectionId:
        url.searchParams.get("collectionId") ?? undefined,
      status:
        (url.searchParams.get("status") as NFT["status"] | null) ??
        undefined,
      minPrice: url.searchParams.get("minPrice") ?? undefined,
      maxPrice: url.searchParams.get("maxPrice") ?? undefined,
      sortBy:
        (url.searchParams.get("sortBy") as NFTFilters["sortBy"]) ??
        undefined,
      sortDirection:
        (url.searchParams.get("sortDirection") as
          | NFTFilters["sortDirection"]) ?? "asc",
      page: Number(url.searchParams.get("page") ?? 1),
      pageSize: Number(url.searchParams.get("pageSize") ?? 12),
    }

    let result = [...nfts]

    if (filters.search) {
      const term = filters.search.toLowerCase()

      result = result.filter(
        (nft) =>
          nft.name.toLowerCase().includes(term) ||
          nft.collection.name.toLowerCase().includes(term) ||
          nft.creator.username.toLowerCase().includes(term),
      )
    }

    if (filters.collectionId) {
      result = result.filter(
        (nft) => nft.collection.id === filters.collectionId,
      )
    }

    if (filters.status) {
      result = result.filter(
        (nft) => nft.status === filters.status,
      )
    }

    if (filters.minPrice) {
      result = result.filter((nft) =>
        new Decimal(nft.price).greaterThanOrEqualTo(
          filters.minPrice!,
        ),
      )
    }

    if (filters.maxPrice) {
      result = result.filter((nft) =>
        new Decimal(nft.price).lessThanOrEqualTo(
          filters.maxPrice!,
        ),
      )
    }

    if (filters.sortBy) {
      const direction =
        filters.sortDirection === "desc" ? -1 : 1

      result.sort((a, b) => {
        if (filters.sortBy === "price") {
          return (
            new Decimal(a.price).comparedTo(b.price) *
            direction
          )
        }

        if (filters.sortBy === "name") {
          return a.name.localeCompare(b.name) * direction
        }

        return (
          (new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()) *
          direction
        )
      })
    }

    const totalItems = result.length

    const page =
      Number.isSafeInteger(filters.page) && filters.page! > 0
        ? filters.page!
        : 1

    const pageSize =
      Number.isSafeInteger(filters.pageSize) &&
      filters.pageSize! > 0
        ? Math.min(filters.pageSize!, 50)
        : 12

    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (page - 1) * pageSize
    const items = result.slice(
      startIndex,
      startIndex + pageSize,
    )

    return HttpResponse.json({
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    })
  }),

  http.get("/api/nfts/:nftId", ({ params }) => {
    const nft = nfts.find(
      (item) => item.id === String(params.nftId),
    )

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado." },
        { status: 404 },
      )
    }

    return HttpResponse.json(nft)
  }),
]
