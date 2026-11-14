
import { api } from "./api"
import type { NFT, NFTFilters, PaginatedResponse } from "@/types"

export async function getNFTs(
  filters: NFTFilters = {},
): Promise<PaginatedResponse<NFT>> {
  const response = await api.get<PaginatedResponse<NFT>>("/nfts", {
    params: filters,
  })

  return response.data
}

export async function getNFTById(id: string): Promise<NFT> {
  const response = await api.get<NFT>(`/nfts/${id}`)

  return response.data
}