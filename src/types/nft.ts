
import type { DecimalString, ID } from "./common"

export type NFTStatus = "available" | "sold" | "unavailable"

export interface NFTCollection {
  id: ID
  name: string
  slug: string
  imageUrl: string
}

export interface NFT {
  id: ID
  name: string
  description: string
  imageUrl: string
  price: DecimalString
  status: NFTStatus
  collection: NFTCollection
  creator: {
    id: ID
    username: string
    avatarUrl: string
  }
  createdAt: string
}

export interface NFTFilters {
  search?: string
  collectionId?: ID
  minPrice?: DecimalString
  maxPrice?: DecimalString
  status?: NFTStatus
  sortBy?: "price" | "createdAt" | "name"
  sortDirection?: "asc" | "desc"
  favoriteIds?: ID[]
  favoritesOnly?: boolean
  page?: number
  pageSize?: number
}
