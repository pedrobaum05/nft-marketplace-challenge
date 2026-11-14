
import { useState, type FormEvent } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { useAuth } from "@/hooks/use-auth"
import { useWallets } from "@/hooks/use-wallets"

export function AccountPage() {
  const { user } = useAuth()

  const {
    wallets,
    isLoading,
    error,
    refetch,
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
  } = useWallets()

  const [walletName, setWalletName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!user) {
    return null
  }

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    try {
      await connect({
        name: walletName.trim(),
        address: walletAddress.trim(),
      })

      setWalletName("")
      setWalletAddress("")
      setFeedback("Carteira conectada com sucesso.")
    } catch {
      setFeedback("Não foi possível conectar a carteira. Verifique os dados ou se ela já está cadastrada.")
    }
  }

  async function handleDisconnect(walletId: string) {
    setFeedback(null)

    try {
      await disconnect(walletId)
      setFeedback("Carteira desconectada com sucesso.")
    } catch {
      setFeedback("Não foi possível desconectar a carteira.")
    }
  }

  return (
    <>
      <AppHeader />

      <main className="min-h-screen space-y-8 bg-background p-8 text-foreground">
        <h1 className="text-3xl font-bold">Minha conta</h1>

        <section className="max-w-lg space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Dados da conta</h2>

          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">E-mail</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">ID da conta</p>
            <p className="break-all font-medium">{user.id}</p>
          </div>
        </section>

        <section className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Minhas carteiras</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie suas carteiras simuladas.
            </p>
          </div>

          <form
            onSubmit={handleConnect}
            className="space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold">Conectar carteira</h3>

            <div className="space-y-2">
              <label htmlFor="wallet-name" className="text-sm font-medium">
                Nome da carteira
              </label>
              <input
                id="wallet-name"
                value={walletName}
                onChange={(event) => setWalletName(event.target.value)}
                placeholder="Ex.: Minha carteira principal"
                required
                maxLength={50}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="wallet-address" className="text-sm font-medium">
                Endereço da carteira
              </label>
              <input
                id="wallet-address"
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value)}
                placeholder="Informe um endereço fictício"
                required
                maxLength={128}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isConnecting || !walletName.trim() || !walletAddress.trim()}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConnecting ? "Conectando..." : "Conectar carteira"}
            </button>
          </form>

          {feedback && (
            <p role="status" className="text-sm text-foreground">
              {feedback}
            </p>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Carteiras cadastradas</h3>

            {isLoading && (
              <p className="text-sm text-muted-foreground">
                Carregando carteiras...
              </p>
            )}

            {error && !isLoading && (
              <div className="space-y-2">
                <p role="alert" className="text-sm text-destructive">
                  Não foi possível carregar suas carteiras.
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="text-sm font-medium text-primary underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !error && wallets.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                Você ainda não possui carteiras cadastradas.
              </p>
            )}

            {!isLoading &&
              !error &&
              wallets.map((wallet) => (
                <article
                  key={wallet.id}
                  className="space-y-3 rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold">{wallet.name}</h4>
                    <span
                      className={
                        wallet.status === "connected"
                          ? "text-sm text-green-500"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {wallet.status === "connected"
                        ? "Conectada"
                        : "Desconectada"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="break-all text-sm">{wallet.address}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className="font-medium">{wallet.balance} ETH</p>
                  </div>

                  {wallet.status === "connected" && (
                    <button
                      type="button"
                      onClick={() => void handleDisconnect(wallet.id)}
                      disabled={isDisconnecting}
                      className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                    >
                      {isDisconnecting
                        ? "Desconectando..."
                        : "Desconectar"}
                    </button>
                  )}
                </article>
              ))}
          </div>
        </section>
      </main>
    </>
  )
}
