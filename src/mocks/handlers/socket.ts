
import { ws } from "msw"
import { toSocketIo } from "@mswjs/socket.io-binding"

import type { NFT, Order } from "@/types"
import { nfts } from "../data/nfts"
import { getActiveSession } from "./auth"

type SocketIoServer = ReturnType<typeof toSocketIo>["server"]

const connections = new Map<SocketIoServer, string | null>()

const socket = ws.link(/\/(?:socket\.io\/)?$/)

const socketConnectionHandler = socket.addEventListener(
  "connection",
  (connection) => {
    const { server } = toSocketIo(connection)

    connections.set(server, null)

    // O binding não envia os pacotes de heartbeat do Engine.IO.
    // O pacote "2" representa um ping do servidor.
    const heartbeat = setInterval(() => {
      try {
        connection.server.send("2")
      } catch {
        clearInterval(heartbeat)
        connections.delete(server)
      }
    }, 20_000)

    server.on("session.authenticate", (_event, userId: unknown) => {
      const session = getActiveSession()

      if (
        !session ||
        typeof userId !== "string" ||
        session.user.id !== userId
      ) {
        connections.set(server, null)
        return
      }

      connections.set(server, session.user.id)
    })

    server.on("nft.subscribe", (_event, nftId: unknown) => {
      if (typeof nftId !== "string") return

      const nft = nfts.find((item) => item.id === nftId)

      if (nft) server.emit("nft.updated", nft)
    })

    connection.client.addEventListener("close", () => {
      clearInterval(heartbeat)
      connections.delete(server)
    })
  },
)

export function emitNftUpdated(nft: NFT): void {
  for (const server of connections.keys()) {
    server.emit("nft.updated", nft)
  }
}

export function emitOrderUpdated(order: Order): void {
  for (const [server, userId] of connections.entries()) {
    if (userId === order.userId) {
      server.emit("order.updated", order)
    }
  }
}

export const socketHandlers = [socketConnectionHandler]
