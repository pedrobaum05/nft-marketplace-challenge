
import { useCallback, useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import Decimal from "decimal.js"

import { AppHeader } from "@/components/layout/app-header"
import { useCart } from "@/hooks/use-cart"
import { useOrders } from "@/hooks/use-orders"
import { useWallets } from "@/hooks/use-wallets"
import { getQuote } from "@/services/checkout.service"
import type { Order } from "@/types"

function formatETH(value: Decimal.Value): string {
  const amount = new Decimal(value)

  return amount.toFixed(Math.max(amount.decimalPlaces(), 3))
}

function getOrderStorageKey(quoteId: string) {
  return `nft-marketplace:checkout-order:${quoteId}`
}

export function CheckoutPage() {
  const { quoteId } = useSearch({ from: "/checkout" })
  const { removeItem, isRemoving } = useCart()

  const [selectedWalletId, setSelectedWalletId] = useState("")
  const [orderId, setOrderId] = useState<string | undefined>(() => {
    if (!quoteId) return undefined

    return localStorage.getItem(getOrderStorageKey(quoteId)) ?? undefined
  })
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => crypto.randomUUID(),
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [cartCleanupError, setCartCleanupError] = useState<string | null>(
    null,
  )

  const cleanedOrderId = useRef<string | null>(null)

  const quoteQuery = useQuery({
    queryKey: ["checkout", "quote", quoteId],
    queryFn: () => getQuote(quoteId),
    enabled: Boolean(quoteId),
    retry: false,
  })

  const {
    wallets,
    isLoading: isLoadingWallets,
    error: walletsError,
  } = useWallets()

  const {
    order,
    isLoadingOrder,
    isErrorOrder,
    create,
    isCreating,
    updateStatus,
    isUpdatingStatus,
  } = useOrders(orderId)

  const quote = quoteQuery.data

  const connectedWallets = wallets.filter(
    (wallet) => wallet.status === "connected",
  )

  async function handleCreateOrder() {
    if (!quote || !selectedWalletId) return

    setActionError(null)

    try {
      const response = await create({
        input: {
          quoteId: quote.quoteId,
          walletId: selectedWalletId,
        },
        idempotencyKey,
      })

      const createdOrderId = response.order.id

      localStorage.setItem(
        getOrderStorageKey(quote.quoteId),
        createdOrderId,
      )

      setOrderId(createdOrderId)
    } catch {
      setActionError(
        "Não foi possível criar o pedido. Verifique a cotação e a carteira selecionada.",
      )
    }
  }

  function handleWalletChange(walletId: string) {
    setSelectedWalletId(walletId)
    setIdempotencyKey(crypto.randomUUID())
    setActionError(null)
  }

  async function handleUpdateOrderStatus(
    status: "confirmed" | "declined",
  ) {
    if (!order) return

    setActionError(null)

    try {
      await updateStatus({
        orderId: order.id,
        status,
      })
    } catch {
      setActionError(
        "Não foi possível atualizar o status do pedido. Tente novamente.",
      )
    }
  }

  const cleanupPurchasedItems = useCallback(
    async (targetOrder: Order) => {
      if (
        targetOrder.status !== "confirmed" ||
        cleanedOrderId.current === targetOrder.id
      ) {
        return
      }

      cleanedOrderId.current = targetOrder.id

      try {
        for (const item of targetOrder.items) {
          await removeItem(item.id)
        }

        setCartCleanupError(null)
      } catch {
        cleanedOrderId.current = null

        setCartCleanupError(
          "A compra foi confirmada, mas não foi possível atualizar completamente o carrinho. Tente novamente.",
        )
      }
    },
    [removeItem],
  )

  useEffect(() => {
    if (order?.status !== "confirmed") return

    const timeoutId = window.setTimeout(() => {
      void cleanupPurchasedItems(order)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [order, cleanupPurchasedItems])

  function handleRetryAfterDecline() {
    if (!order || order.status !== "declined" || !quote) {
      return
    }

    localStorage.removeItem(getOrderStorageKey(quote.quoteId))

    setOrderId(undefined)
    setIdempotencyKey(crypto.randomUUID())
    setActionError(null)
    setCartCleanupError(null)
    cleanedOrderId.current = null
  }

  function handleRetryCartCleanup() {
    if (!order || order.status !== "confirmed") return

    cleanedOrderId.current = null
    setCartCleanupError(null)
    void cleanupPurchasedItems(order)
  }

  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">
          Finalizar compra
        </h1>

        {quoteQuery.isLoading && (
          <p>Carregando cotação...</p>
        )}

        {quoteQuery.isError && (
          <div className="rounded-lg border border-red-500/40 p-4">
            Não foi possível carregar a cotação. Volte ao carrinho
            e gere uma nova cotação.
          </div>
        )}

        {!quoteId && (
          <div className="rounded-lg border border-yellow-500/40 p-4">
            Nenhuma cotação foi informada. Volte ao carrinho para
            iniciar o checkout.
          </div>
        )}

        {quote && (
          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-lg border border-white/10 p-5">
              <h2 className="mb-5 text-lg font-semibold">
                Resumo da compra
              </h2>

              <div className="space-y-4">
                {quote.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium">
                        {item.nft.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Quantidade: {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm">
                      {formatETH(item.nft.price)} ETH
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-white/10" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatETH(quote.subtotal)} ETH</span>
                </div>

                <div className="flex justify-between">
                  <span>Desconto</span>
                  <span>- {formatETH(quote.discount)} ETH</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxa de rede</span>
                  <span>{formatETH(quote.networkFee)} ETH</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{formatETH(quote.total)} ETH</span>
                </div>

                <p className="text-xs text-gray-400">
                  Cotação válida até{" "}
                  {new Date(quote.expiresAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 p-5">
              <h2 className="mb-5 text-lg font-semibold">
                Carteira de pagamento
              </h2>

              {isLoadingWallets && (
                <p>Carregando carteiras...</p>
              )}

              {walletsError && (
                <p className="text-red-400">
                  Não foi possível carregar suas carteiras.
                </p>
              )}

              {!isLoadingWallets &&
                !walletsError &&
                connectedWallets.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Nenhuma carteira conectada. Acesse sua conta
                    para conectar uma carteira antes de continuar.
                  </p>
                )}

              {connectedWallets.length > 0 && (
                <div className="space-y-3">
                  {connectedWallets.map((wallet) => (
                    <label
                      key={wallet.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 p-4"
                    >
                      <input
                        type="radio"
                        name="wallet"
                        value={wallet.id}
                        checked={selectedWalletId === wallet.id}
                        onChange={() => handleWalletChange(wallet.id)}
                      />

                      <span className="min-w-0">
                        <span className="block font-medium">
                          {wallet.name}
                        </span>
                        <span className="block truncate text-xs text-gray-400">
                          {wallet.address}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {actionError && (
                <p role="alert" className="mt-4 text-sm text-red-400">
                  {actionError}
                </p>
              )}

              {!orderId && (
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={
                    !selectedWalletId ||
                    isCreating ||
                    isLoadingWallets ||
                    Boolean(walletsError)
                  }
                  className="mt-6 w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? "Processando..." : "Confirmar compra"}
                </button>
              )}
            </section>
          </div>
        )}

        {orderId && (
          <section className="mt-8 rounded-lg border border-white/10 p-5">
            <h2 className="font-semibold">
              Status do pedido
            </h2>

            {isLoadingOrder && (
              <p className="mt-2">Consultando pedido...</p>
            )}

            {isErrorOrder && (
              <p role="alert" className="mt-2 text-sm text-red-400">
                Não foi possível consultar este pedido. Verifique sua
                sessão ou tente atualizar a página.
              </p>
            )}

            {!isLoadingOrder && !isErrorOrder && !order && (
              <p className="mt-2 text-sm text-gray-400">
                Aguardando atualização do pedido...
              </p>
            )}

            {order && (
              <div className="mt-3 space-y-3">
                <p>Pedido: {order.id}</p>

                {order.status === "pending" && (
                  <>
                    <p className="text-yellow-400">
                      Pagamento pendente. Aguardando confirmação.
                    </p>

                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                      <p className="text-sm text-gray-300">
                        Ambiente de demonstração: utilize uma das opções
                        abaixo para simular o resultado do pagamento.
                        Nenhuma transação financeira real será realizada.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOrderStatus("confirmed")
                          }
                          disabled={isUpdatingStatus}
                          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {isUpdatingStatus
                            ? "Processando..."
                            : "Simular aprovação"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOrderStatus("declined")
                          }
                          disabled={isUpdatingStatus}
                          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          {isUpdatingStatus
                            ? "Processando..."
                            : "Simular recusa"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {order.status === "confirmed" && (
                  <div>
                    <p className="text-green-400">
                      Compra confirmada com sucesso!
                    </p>

                    {isRemoving && (
                      <p className="mt-2 text-sm text-gray-400">
                        Atualizando carrinho...
                      </p>
                    )}

                    {cartCleanupError && (
                      <div className="mt-3 space-y-3">
                        <p role="alert" className="text-sm text-red-400">
                          {cartCleanupError}
                        </p>

                        <button
                          type="button"
                          onClick={handleRetryCartCleanup}
                          disabled={isRemoving}
                          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                          Tentar atualizar carrinho novamente
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {order.status === "declined" && (
                  <div className="space-y-3">
                    <p className="text-red-400">
                      O pedido foi recusado.
                    </p>

                    <button
                      type="button"
                      onClick={handleRetryAfterDecline}
                      className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  )
}
