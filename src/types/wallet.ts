
import type { DecimalString, ID } from "./common"

export type WalletStatus = "connected" | "disconnected"

export interface Wallet {
  id: ID
  address: string
  name: string
  balance: DecimalString
  status: WalletStatus
  createdAt: string
}

export interface ConnectWalletInput {
  name: string
  address: string
}
