
import type { ReactNode } from "react"
import { Navigate } from "@tanstack/react-router"

import { useAuth } from "@/hooks/use-auth"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    error,
  } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>Verificando sua sessão...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <p role="alert">
          Não foi possível verificar sua sessão. Atualize a página e tente novamente.
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}
