import type { ID } from "./common"

export interface User {
  id: ID
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

export interface Session {
  accessToken: string
  user: User
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface UserProfileUpdate {
  name?: string
  avatarUrl?: string | null
}

export interface PasswordUpdate {
  currentPassword: string
  newPassword: string
}