
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "@tanstack/react-router"

import { useAuth } from "@/hooks/use-auth"

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isRegistering } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.")
      return
    }

    try {
      await register({ name, email, password })
      await navigate({ to: "/" })
    } catch {
      setErrorMessage(
        "Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.",
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            Criar conta
          </h1>

          <p className="text-muted-foreground">
            Cadastre-se para acessar o NFT Marketplace.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 8 caracteres.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar senha
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
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
            disabled={isRegistering}
            className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRegistering ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já possui uma conta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  )
}
