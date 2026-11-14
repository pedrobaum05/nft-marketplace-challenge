
import { http, HttpResponse } from "msw"

import type { Wallet } from "@/types"
import { getActiveSession } from "./auth"

interface StoredWallet extends Wallet {
  userId: string
}

const WALLETS_STORAGE_KEY = "nft-marketplace:mock-wallets"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isStoredWallet(value: unknown): value is StoredWallet {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.address === "string" &&
    typeof value.name === "string" &&
    typeof value.balance === "string" &&
    (value.status === "connected" || value.status === "disconnected") &&
    typeof value.createdAt === "string"
  )
}

function readWallets(): StoredWallet[] {
  try {
    const stored = localStorage.getItem(WALLETS_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isStoredWallet)
  } catch {
    return []
  }
}

function saveWallets(wallets: StoredWallet[]): void {
  localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets))
}

function toPublicWallet(wallet: StoredWallet): Wallet {
  return {
    id: wallet.id,
    address: wallet.address,
    name: wallet.name,
    balance: wallet.balance,
    status: wallet.status,
    createdAt: wallet.createdAt,
  }
}

export const walletHandlers = [
  http.get("/api/wallets", () => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const wallets = readWallets()
      .filter((wallet) => wallet.userId === session.user.id)
      .map(toPublicWallet)

    return HttpResponse.json(wallets)
  }),

  http.post("/api/wallets", async ({ request }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const body: unknown = await request.json()

    if (!isRecord(body)) {
      return HttpResponse.json(
        { message: "Dados da carteira inválidos." },
        { status: 400 },
      )
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const address =
      typeof body.address === "string" ? body.address.trim() : ""

    if (!name || !address) {
      return HttpResponse.json(
        { message: "Informe o nome e o endereço da carteira." },
        { status: 400 },
      )
    }

    const wallets = readWallets()

    const alreadyExists = wallets.some(
      (wallet) =>
        wallet.userId === session.user.id &&
        wallet.address.toLowerCase() === address.toLowerCase(),
    )

    if (alreadyExists) {
      return HttpResponse.json(
        { message: "Esta carteira já está cadastrada." },
        { status: 409 },
      )
    }

    const newWallet: StoredWallet = {
      id: `wallet-${crypto.randomUUID()}`,
      userId: session.user.id,
      name,
      address,
      balance: "0",
      status: "connected",
      createdAt: new Date().toISOString(),
    }

    saveWallets([...wallets, newWallet])

    return HttpResponse.json(toPublicWallet(newWallet), {
      status: 201,
    })
  }),

  http.delete("/api/wallets/:walletId", ({ params }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const wallets = readWallets()
    const walletIndex = wallets.findIndex(
      (wallet) =>
        wallet.id === String(params.walletId) &&
        wallet.userId === session.user.id,
    )

    if (walletIndex === -1) {
      return HttpResponse.json(
        { message: "Carteira não encontrada." },
        { status: 404 },
      )
    }

    const updatedWallet: StoredWallet = {
      ...wallets[walletIndex],
      status: "disconnected",
    }

    wallets[walletIndex] = updatedWallet
    saveWallets(wallets)

    return HttpResponse.json(toPublicWallet(updatedWallet))
  }),
]
