
import { useState, type FormEvent } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { useAuth } from "@/hooks/use-auth"
import { useWallets } from "@/hooks/use-wallets"

export function AccountPage() {
  const {
    user,
    updateProfile,
    updatePassword,
    isUpdatingProfile,
    isUpdatingPassword,
  } = useAuth()

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

  const [profileName, setProfileName] = useState(user?.name ?? "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [walletName, setWalletName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null)

  if (!user) {
    return null
  }

  function clearFeedback() {
    setFeedback(null)
    setErrorFeedback(null)
  }

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()

    try {
      await updateProfile({
        name: profileName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      })

      setFeedback("Perfil atualizado com sucesso.")
    } catch {
      setErrorFeedback("Não foi possível atualizar seu perfil.")
    }
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()

    if (newPassword !== confirmPassword) {
      setErrorFeedback("A confirmação da senha não corresponde.")
      return
    }

    if (newPassword.length < 8) {
      setErrorFeedback("A nova senha deve ter pelo menos 8 caracteres.")
      return
    }

    try {
      await updatePassword({
        currentPassword,
        newPassword,
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setFeedback("Senha alterada com sucesso.")
    } catch {
      setErrorFeedback(
        "Não foi possível alterar a senha. Verifique a senha atual e tente novamente.",
      )
    }
  }

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()

    try {
      await connect({
        name: walletName.trim(),
        address: walletAddress.trim(),
      })

      setWalletName("")
      setWalletAddress("")
      setFeedback("Carteira conectada com sucesso.")
    } catch {
      setErrorFeedback(
        "Não foi possível conectar a carteira. Verifique os dados ou se ela já está cadastrada.",
      )
    }
  }

  async function handleDisconnect(walletId: string) {
    clearFeedback()

    try {
      await disconnect(walletId)
      setFeedback("Carteira desconectada com sucesso.")
    } catch {
      setErrorFeedback("Não foi possível desconectar a carteira.")
    }
  }

  return (
    <>
      <AppHeader />

      <main className="min-h-screen space-y-8 bg-background p-8 text-foreground">
        <h1 className="text-3xl font-bold">Minha conta</h1>

        <section className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Dados da conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize suas informações pessoais.
            </p>
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Nome
              </label>
              <input
                id="profile-name"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                required
                maxLength={100}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-avatar" className="text-sm font-medium">
                URL do avatar
              </label>
              <input
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://exemplo.com/avatar.png"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para remover o avatar.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile || !profileName.trim()}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdatingProfile ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>

          <form
            onSubmit={handleUpdatePassword}
            className="space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold">Alterar senha</h3>

            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Senha atual
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                Nova senha
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmar nova senha
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={
                isUpdatingPassword ||
                !currentPassword ||
                newPassword.length < 8 ||
                !confirmPassword
              }
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdatingPassword ? "Alterando..." : "Alterar senha"}
            </button>
          </form>

          {(feedback || errorFeedback) && (
            <p
              role={errorFeedback ? "alert" : "status"}
              className={
                errorFeedback
                  ? "text-sm text-destructive"
                  : "text-sm text-foreground"
              }
            >
              {errorFeedback ?? feedback}
            </p>
          )}

          <div className="space-y-2 rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold">E-mail</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado nesta versão.
            </p>

            <h3 className="pt-3 font-semibold">ID da conta</h3>
            <p className="break-all text-sm">{user.id}</p>
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
                      {isDisconnecting ? "Desconectando..." : "Desconectar"}
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
