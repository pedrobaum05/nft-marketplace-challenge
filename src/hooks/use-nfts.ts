
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { NFTFilters } from "@/types"
import { getNFTs } from "@/services/nft.service"

export function useNFTs(filters: NFTFilters = {}) {
  return useQuery({
    queryKey: ["nfts", filters],
    queryFn: () => getNFTs(filters),
    placeholderData: keepPreviousData,
  })
}
