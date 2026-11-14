
import { useState } from "react"
import axios from "axios"
import { Link } from "@tanstack/react-router"
import { AppHeader } from "@/components/layout/app-header"
import { useNFT } from "@/hooks/use-nft"
import { useCart } from "@/hooks/use-cart"

interface NFTDetailPageProps {
  nftId: string
}

export function NFTDetailPage({ nftId }: NFTDetailPageProps) {
  const { data: nft, isPending, isError, error, refetch } = useNFT(nftId)
  const { addItem, isAdding } = useCart()

  const [cartMessage, setCartMessage] = useState("")
  const [cartError, setCartError] = useState("")

  async function handleAddToCart() {
    if (!nft) return

    setCartMessage("")
    setCartError("")

    try {
      await addItem({ nftId: nft.id })
      setCartMessage("NFT adicionado ao carrinho com sucesso.")
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setCartError("Este NFT já está no carrinho.")
        return
      }

      setCartError("Não foi possível adicionar este NFT ao carrinho. Tente novamente.")
    }
  }

  if (isPending) {
    return (
      <>
        <AppHeader />
        <main className="p-8">Carregando NFT...</main>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <AppHeader />
        <main className="space-y-4 p-8">
          <p>Erro ao carregar NFT: {error.message}</p>
          <button onClick={() => refetch()}>Tentar novamente</button>
        </main>
      </>
    )
  }

  if (!nft) {
    return (
      <>
        <AppHeader />
        <main className="p-8">NFT não encontrado.</main>
      </>
    )
  }

  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-background p-6 text-foreground md:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <Link
            to="/"
            className="inline-block text-sm text-muted-foreground transition hover:text-primary"
          >
            ← Voltar ao catálogo
          </Link>

          <section className="grid gap-10 md:grid-cols-2">
            <div>
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="aspect-square w-full rounded-xl border border-border object-cover"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {nft.collection.name}
                </p>

                <h1 className="text-3xl font-bold md:text-4xl">
                  {nft.name}
                </h1>

                <p className="text-sm text-muted-foreground">
                  Criado por {nft.creator.username}
                </p>
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Preço atual
                  </p>

                  <p className="text-3xl font-bold text-primary">
                    {nft.price} ETH
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Status: {nft.status}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={isAdding || nft.status !== "available"}
                  className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding
                    ? "Adicionando..."
                    : nft.status !== "available"
                      ? "Indisponível"
                      : "Adicionar ao carrinho"}
                </button>

                {cartMessage && (
                  <p role="status" className="text-sm text-green-600">
                    {cartMessage}
                  </p>
                )}

                {cartError && (
                  <p role="alert" className="text-sm text-destructive">
                    {cartError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold">Sobre este NFT</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {nft.description}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
