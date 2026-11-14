
import type {
  LoginCredentials,
  RegisterCredentials,
  Session,
} from "@/types"

import { api } from "./api"

export async function register(
  credentials: RegisterCredentials,
): Promise<Session> {
  const { data } = await api.post<Session>(
    "/auth/register",
    credentials,
  )

  return data
}

export async function login(
  credentials: LoginCredentials,
): Promise<Session> {
  const { data } = await api.post<Session>(
    "/auth/login",
    credentials,
  )

  return data
}

export async function getSession(): Promise<Session> {
  const { data } = await api.get<Session>("/auth/session")

  return data
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout")
}
