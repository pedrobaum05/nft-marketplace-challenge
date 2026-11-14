
import type { ConnectWalletInput, Wallet } from "@/types"
import { api } from "./api"

export async function getWallets(): Promise<Wallet[]> {
  const { data } = await api.get<Wallet[]>("/wallets")
  return data
}

export async function connectWallet(
  input: ConnectWalletInput,
): Promise<Wallet> {
  const { data } = await api.post<Wallet>("/wallets", input)
  return data
}

export async function disconnectWallet(
  walletId: string,
): Promise<Wallet> {
  const { data } = await api.delete<Wallet>(`/wallets/${walletId}`)
  return data
}
