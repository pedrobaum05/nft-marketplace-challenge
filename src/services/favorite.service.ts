
import { api } from "./api"

interface FavoritesResponse {
  nftIds: string[]
}

export async function getFavorites(): Promise<string[]> {
  const { data } = await api.get<FavoritesResponse>("/favorites")
  return data.nftIds
}

export async function addFavorite(nftId: string): Promise<void> {
  await api.post(`/favorites/${nftId}`)
}

export async function removeFavorite(nftId: string): Promise<void> {
  await api.delete(`/favorites/${nftId}`)
}
