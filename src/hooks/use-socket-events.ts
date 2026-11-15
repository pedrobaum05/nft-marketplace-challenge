
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { io } from "socket.io-client"

import { useAuth } from "@/hooks/use-auth"
import type {
  CreateOrderResponse,
  NFT,
  Order,
  PaginatedResponse,
} from "@/types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isNFT(value: unknown): value is NFT {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.price === "string" &&
    (value.status === "available" ||
      value.status === "sold" ||
      value.status === "unavailable")
  )
}

function isOrder(value: unknown): value is Order {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.quoteId === "string" &&
    typeof value.walletId === "string" &&
    typeof value.total === "string" &&
    (value.status === "pending" ||
      value.status === "confirmed" ||
      value.status === "declined")
  )
}

export function useSocketEvents() {
  const queryClient = useQueryClient()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    console.log("[Socket.IO] Hook executado", {
      isLoading,
      userId: user?.id ?? null,
    })

    if (!user?.id) {
      console.log("[Socket.IO] Conexão não iniciada: usuário indisponível")
      return
    }

    console.log("[Socket.IO] Iniciando conexão...")

    const socket = io(window.location.origin, {
      path: "/socket.io/",
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
    })

    const handleConnect = () => {
      console.log("[Socket.IO] Conectado")
      socket.emit("session.authenticate", user.id)
    }

    const handleConnectError = (error: Error) => {
      console.error("[Socket.IO] Erro de conexão:", error.message)
    }

    const handleDisconnect = (reason: string) => {
      console.warn("[Socket.IO] Desconectado:", reason)
    }

    const handleNftUpdated = (payload: unknown) => {
      if (!isNFT(payload)) return

      queryClient.setQueryData<NFT>(
        ["nft", payload.id],
        payload,
      )

      queryClient.setQueriesData<PaginatedResponse<NFT>>(
        { queryKey: ["nfts"] },
        (current) => {
          if (!current) return current

          return {
            ...current,
            items: current.items.map((nft) =>
              nft.id === payload.id ? payload : nft,
            ),
          }
        },
      )
    }

    const handleOrderUpdated = (payload: unknown) => {
      if (!isOrder(payload) || payload.userId !== user.id) return

      queryClient.setQueryData<CreateOrderResponse>(
        ["orders", user.id, payload.id],
        { order: payload },
      )
    }

    socket.on("connect", handleConnect)
    socket.on("connect_error", handleConnectError)
    socket.on("disconnect", handleDisconnect)
    socket.on("nft.updated", handleNftUpdated)
    socket.on("order.updated", handleOrderUpdated)

    socket.connect()

    return () => {
      socket.off("connect", handleConnect)
      socket.off("connect_error", handleConnectError)
      socket.off("disconnect", handleDisconnect)
      socket.off("nft.updated", handleNftUpdated)
      socket.off("order.updated", handleOrderUpdated)
      socket.disconnect()
    }
  }, [queryClient, user?.id, isLoading])
}
