import { useQuery } from "@tanstack/react-query"
import { getNFTById } from "@/services/nft.service"

export function useNFT(id: string) {
  return useQuery({
    queryKey: ["nft", id],
    queryFn: () => getNFTById(id),
    enabled: Boolean(id),
  })
}