
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { ConnectWalletInput } from "@/types"
import {
  connectWallet,
  disconnectWallet,
  getWallets,
} from "@/services/wallet.service"

const WALLETS_QUERY_KEY = ["wallets"] as const

export function useWallets() {
  const queryClient = useQueryClient()

  const walletsQuery = useQuery({
    queryKey: WALLETS_QUERY_KEY,
    queryFn: getWallets,
    staleTime: 30 * 1000,
    retry: false,
  })

  const connectMutation = useMutation({
    mutationFn: (input: ConnectWalletInput) => connectWallet(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: WALLETS_QUERY_KEY,
      })
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (walletId: string) => disconnectWallet(walletId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: WALLETS_QUERY_KEY,
      })
    },
  })

  return {
    wallets: walletsQuery.data ?? [],
    isLoading: walletsQuery.isLoading,
    error: walletsQuery.error,
    refetch: walletsQuery.refetch,
    connect: connectMutation.mutateAsync,
    disconnect: disconnectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  }
}
