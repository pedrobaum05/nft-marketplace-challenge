
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type {
  CreateOrderRequest,
  OrderStatus,
} from "@/types"

import {
  createOrder,
  getOrder,
  updateOrderStatus,
} from "@/services/order.service"

import { useAuth } from "./use-auth"

interface CreateOrderInput {
  input: CreateOrderRequest
  idempotencyKey: string
}

interface UpdateOrderInput {
  orderId: string
  status: Exclude<OrderStatus, "pending">
}

export function useOrders(orderId?: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const orderQueryKey = [
    "orders",
    user?.id,
    orderId,
  ] as const

  const orderQuery = useQuery({
    queryKey: orderQueryKey,
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(user?.id && orderId),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.order.status === "pending"
        ? 2000
        : false,
  })

  const createMutation = useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: CreateOrderInput) => createOrder(input, idempotencyKey),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["orders", user?.id, response.order.id],
        response,
      )
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId: targetOrderId,
      status,
    }: UpdateOrderInput) =>
      updateOrderStatus(targetOrderId, status),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["orders", user?.id, response.order.id],
        response,
      )
    },
  })

  return {
    order: orderQuery.data?.order,
    isLoadingOrder: orderQuery.isLoading,
    isErrorOrder: orderQuery.isError,
    orderError: orderQuery.error,
    refetchOrder: orderQuery.refetch,

    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    updateStatusError: updateStatusMutation.error,
  }
}
