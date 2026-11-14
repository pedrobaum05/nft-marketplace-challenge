
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import Decimal from "decimal.js"

import { AppHeader } from "@/components/layout/app-header"
import { useCart } from "@/hooks/use-cart"
import { createQuote } from "@/services/checkout.service"
import type { CartQuote } from "@/types"

export function CartPage() {
  const {
    items,
    itemCount,
    isLoading,
    isError,
    error,
    refetch,
    updateItem,
    removeItem,
    clear,
    isMutating,
  } = useCart()

  const [actionError, setActionError] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [quote, setQuote] = useState<CartQuote | null>(null)
  const [quoteError, setQuoteError] = useState("")
  const [isQuoting, setIsQuoting] = useState(false)

  const subtotal = items.reduce(
    (total, item) =>
      total.plus(new Decimal(item.nft.price).mul(item.quantity)),
    new Decimal(0),
  )

  async function handleUpdateQuantity(
    itemId: string,
    quantity: number,
  ) {
    setActionError("")

    try {
      await updateItem({ itemId, quantity })
      setQuote(null)
      setQuoteError("")
    } catch {
      setActionError("Não foi possível atualizar a quantidade.")
    }
  }

  async function handleRemoveItem(itemId: string) {
    setActionError("")

    try {
      await removeItem(itemId)
      setQuote(null)
      setQuoteError("")
    } catch {
      setActionError("Não foi possível remover este NFT.")
    }
  }

  async function handleClearCart() {
    setActionError("")

    try {
      await clear()
      setQuote(null)
      setQuoteError("")
    } catch {
      setActionError("Não foi possível limpar o carrinho.")
    }
  }

  async function handleCreateQuote() {
    setQuoteError("")
    setActionError("")
    setIsQuoting(true)

    try {
      const newQuote = await createQuote(
        couponCode.trim()
          ? { couponCode: couponCode.trim() }
          : {},
      )

      setQuote(newQuote)
    } catch {
      setQuote(null)
      setQuoteError(
        "Não foi possível gerar a cotação. Verifique o cupom e tente novamente.",
      )
    } finally {
      setIsQuoting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <div className="space-y-2">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition hover:text-primary"
          >
            ← Voltar ao catálogo
          </Link>

          <h1 className="text-3xl font-bold md:text-4xl">
            Meu carrinho
          </h1>

          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
          </p>
        </div>

        {isLoading && (
          <div
            className="rounded-xl border border-border bg-card p-8 text-center"
            role="status"
          >
            Carregando carrinho...
          </div>
        )}

        {isError && (
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <p role="alert" className="text-sm text-red-500">
              Não foi possível carregar o carrinho: {error?.message}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-bold">
              Seu carrinho está vazio
            </h2>

            <p className="text-muted-foreground">
              Explore o catálogo e encontre NFTs para adicionar.
            </p>

            <Link
              to="/"
              className="inline-block rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Explorar NFTs
            </Link>
          </section>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:flex-row"
                >
                  <img
                    src={item.nft.imageUrl}
                    alt={item.nft.name}
                    className="aspect-square w-full rounded-lg object-cover sm:h-36 sm:w-36"
                  />

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {item.nft.collection.name}
                      </p>

                      <h2 className="text-lg font-bold">
                        {item.nft.name}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        {item.nft.price} ETH por unidade
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${item.nft.name}`}
                          disabled={isMutating || item.quantity <= 1}
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          className="h-9 w-9 rounded-md border border-border disabled:opacity-40"
                        >
                          −
                        </button>

                        <span
                          className="min-w-6 text-center font-semibold"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${item.nft.name}`}
                          disabled={isMutating || item.quantity >= 99}
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                          className="h-9 w-9 rounded-md border border-border disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => void handleRemoveItem(item.id)}
                        className="text-sm font-medium text-red-500 transition hover:underline disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <div className="text-left font-bold sm:min-w-28 sm:text-right">
                    {new Decimal(item.nft.price)
                      .mul(item.quantity)
                      .toString()}{" "}
                    ETH
                  </div>
                </article>
              ))}

              {actionError && (
                <p role="alert" className="text-sm text-red-500">
                  {actionError}
                </p>
              )}

              <button
                type="button"
                disabled={isMutating}
                onClick={() => void handleClearCart()}
                className="text-sm text-muted-foreground transition hover:text-red-500 disabled:opacity-50"
              >
                Limpar carrinho
              </button>
            </section>

            <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold">
                Resumo do pedido
              </h2>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Itens
                </span>

                <span>{itemCount}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span>
                  {quote?.subtotal ?? subtotal.toString()} ETH
                </span>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <label
                  htmlFor="coupon-code"
                  className="block text-sm font-medium"
                >
                  Cupom de desconto
                </label>

                <div className="flex gap-2">
                  <input
                    id="coupon-code"
                    type="text"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value)
                      setQuote(null)
                      setQuoteError("")
                    }}
                    placeholder="Ex.: WELCOME10"
                    maxLength={30}
                    disabled={isQuoting}
                    className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleCreateQuote()}
                  disabled={isQuoting || isMutating}
                  className="w-full rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isQuoting
                    ? "Calculando cotação..."
                    : "Gerar cotação"}
                </button>

                {quoteError && (
                  <p role="alert" className="text-sm text-red-500">
                    {quoteError}
                  </p>
                )}

                {quote?.coupon && (
                  <p className="text-sm text-green-600">
                    Cupom {quote.coupon.code} aplicado com sucesso.
                  </p>
                )}

                {quote && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Desconto
                      </span>

                      <span className="text-green-600">
                        - {quote.discount} ETH
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Taxa de rede
                      </span>

                      <span>{quote.networkFee} ETH</span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Cotação válida até{" "}
                      {new Date(quote.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">Total</span>

                  <span className="text-xl font-bold text-primary">
                    {quote?.total ?? subtotal.toString()} ETH
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Os valores são simulados para este teste técnico.
                Nenhum pagamento real será realizado.
              </p>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground opacity-50"
              >
                Checkout em implementação
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
