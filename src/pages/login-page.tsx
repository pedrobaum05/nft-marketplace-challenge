
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "@tanstack/react-router"

import { useAuth } from "@/hooks/use-auth"

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoggingIn } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    try {
      await login({ email, password })
      await navigate({ to: "/" })
    } catch {
      setErrorMessage(
        "Não foi possível entrar. Verifique seu e-mail e sua senha.",
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            NFT Marketplace
          </h1>

          <p className="text-muted-foreground">
            Entre na sua conta para continuar.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingIn ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não possui uma conta?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  )
}
