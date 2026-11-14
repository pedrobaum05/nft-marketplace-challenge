
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favorite.service"

interface FavoriteMutation {
  nftId: string
  action: "add" | "remove"
}

interface FavoriteMutationContext {
  previousFavorites: string[] | undefined
}

export function useFavorites() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const queryKey = ["favorites", user?.id] as const

  const favoritesQuery = useQuery({
    queryKey,
    queryFn: getFavorites,
    enabled: Boolean(user),
    staleTime: 30 * 1000,
    retry: false,
  })

  const favoriteMutation = useMutation<
    void,
    unknown,
    FavoriteMutation,
    FavoriteMutationContext
  >({
    mutationFn: async ({ nftId, action }) => {
      if (action === "add") {
        await addFavorite(nftId)
        return
      }

      await removeFavorite(nftId)
    },

    onMutate: async ({ nftId, action }) => {
      await queryClient.cancelQueries({ queryKey })

      const previousFavorites =
        queryClient.getQueryData<string[]>(queryKey)

      queryClient.setQueryData<string[]>(queryKey, (current = []) => {
        if (action === "add") {
          return current.includes(nftId)
            ? current
            : [...current, nftId]
        }

        return current.filter((id) => id !== nftId)
      })

      return { previousFavorites }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(
          queryKey,
          context.previousFavorites,
        )
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    favorites: favoritesQuery.data ?? [],
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    refetch: favoritesQuery.refetch,

    addFavorite: (nftId: string) =>
      favoriteMutation.mutateAsync({ nftId, action: "add" }),

    removeFavorite: (nftId: string) =>
      favoriteMutation.mutateAsync({ nftId, action: "remove" }),

    isUpdating: favoriteMutation.isPending,
  }
}
