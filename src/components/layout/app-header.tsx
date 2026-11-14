
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"

import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"

export function AppHeader() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth()
  const { itemCount } = useCart()

  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogout() {
    setErrorMessage("")

    try {
      await logout()
      await navigate({ to: "/login" })
    } catch {
      setErrorMessage("Não foi possível encerrar sua sessão.")
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
      <Link to="/" className="text-xl font-bold">
        NFT Marketplace
      </Link>

      <nav
        aria-label="Navegação principal"
        className="flex flex-wrap items-center gap-4"
      >
        <Link
          to="/cart"
          className="text-sm font-medium transition hover:text-primary"
          aria-label={`Carrinho, ${itemCount} itens`}
        >
          Carrinho ({itemCount})
        </Link>

        {isAuthenticated && user ? (
          <>
            <Link
              to="/account"
              className="text-sm font-medium transition hover:text-primary"
            >
              Minha conta
            </Link>

            <span className="text-sm text-muted-foreground">
              Olá, {user.name}
            </span>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium hover:text-primary"
            >
              Entrar
            </Link>

            <Link
              to="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Criar conta
            </Link>
          </>
        )}
      </nav>

      {errorMessage && (
        <p role="alert" className="w-full text-sm text-red-500">
          {errorMessage}
        </p>
      )}
    </header>
  )
}
