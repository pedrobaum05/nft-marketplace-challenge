
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "./use-auth"

import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/services/cart.service"

import type { Cart } from "@/types"

export function useCart() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Cada usuário possui seu próprio cache.
  // Visitantes utilizam uma chave separada.
  const cartQueryKey = ["cart", user?.id ?? "guest"]

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
  })

  const updateCache = (cart: Cart) => {
    queryClient.setQueryData<Cart>(cartQueryKey, cart)
  }

  const addMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: updateCache,
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: updateCache,
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: updateCache,
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: updateCache,
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  return {
    cart: cartQuery.data,
    items: cartQuery.data?.items ?? [],
    itemCount:
      cartQuery.data?.items.reduce(
        (total, item) => total + item.quantity,
        0,
      ) ?? 0,

    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    refetch: cartQuery.refetch,

    addItem: addMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    removeItem: removeMutation.mutateAsync,
    clear: clearMutation.mutateAsync,

    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isClearing: clearMutation.isPending,

    isMutating:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
  }
}
