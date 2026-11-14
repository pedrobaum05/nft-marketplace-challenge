
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

import {
  getSession,
  login,
  logout,
  register,
} from "@/services/auth.service"

import type {
  LoginCredentials,
  RegisterCredentials,
  Session,
} from "@/types"

const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const

const USER_SCOPED_QUERY_KEYS = [
  "profile",
  "wallets",
  "orders",
  "favorites",
] as const

function clearUserScopedCache(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({
    predicate: (query) => {
      const queryKey = query.queryKey[0]

      return USER_SCOPED_QUERY_KEYS.some((key) => key === queryKey)
    },
  })
}

async function fetchSession(): Promise<Session | null> {
  try {
    return await getSession()
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }

    throw error
  }
}

export function useAuth() {
  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (newSession) => {
      const currentSession =
        queryClient.getQueryData<Session | null>(AUTH_SESSION_QUERY_KEY)

      if (currentSession?.user.id !== newSession.user.id) {
        clearUserScopedCache(queryClient)
      }

      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, newSession)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      register(credentials),
    onSuccess: (newSession) => {
      const currentSession =
        queryClient.getQueryData<Session | null>(AUTH_SESSION_QUERY_KEY)

      if (currentSession?.user.id !== newSession.user.id) {
        clearUserScopedCache(queryClient)
      }

      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, newSession)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUserScopedCache(queryClient)

      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
    },
  })

  return {
    session: sessionQuery.data ?? null,
    user: sessionQuery.data?.user ?? null,
    isAuthenticated: Boolean(sessionQuery.data),
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,

    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
