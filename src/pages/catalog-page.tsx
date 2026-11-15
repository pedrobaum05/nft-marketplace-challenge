
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"

import { AppHeader } from "@/components/layout/app-header"
import { useAuth } from "@/hooks/use-auth"
import { useFavorites } from "@/hooks/use-favorites"
import { useNFTs } from "@/hooks/use-nfts"

const sortOptions = {
  newest: {
    sortBy: "createdAt",
    sortDirection: "desc",
  },
  oldest: {
    sortBy: "createdAt",
    sortDirection: "asc",
  },
  priceAsc: {
    sortBy: "price",
    sortDirection: "asc",
  },
  priceDesc: {
    sortBy: "price",
    sortDirection: "desc",
  },
  nameAsc: {
    sortBy: "name",
    sortDirection: "asc",
  },
} as const

type SortOption = keyof typeof sortOptions

const PAGE_SIZE = 12

interface SearchInputProps {
  initialValue: string
  onSearch: (value: string) => void
}

function SearchInput({ initialValue, onSearch }: SearchInputProps) {
  const [search, setSearch] = useState(initialValue)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onSearch(search.trim())
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search, onSearch])

  function handleClearSearch() {
    setSearch("")
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Pesquisar NFTs..."
        aria-label="Pesquisar NFTs"
        className="w-full rounded-md border border-border bg-card px-4 py-2 pr-10 text-foreground outline-none focus:border-primary"
      />

      {search.length > 0 && (
        <button
          type="button"
          onClick={handleClearSearch}
          aria-label="Limpar pesquisa"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export function CatalogPage() {
  const searchParams = useSearch({ from: "/" })
  const navigate = useNavigate({ from: "/" })

  const { isAuthenticated } = useAuth()

  const {
    favorites,
    addFavorite,
    removeFavorite,
    isUpdating,
  } = useFavorites()

  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const sort: SortOption = searchParams.sort ?? "newest"
  const page = searchParams.page ?? 1
  const currentSearch = searchParams.q ?? ""

  const handleSearch = useCallback(
    (value: string) => {
      if (value === currentSearch) {
        return
      }

      void navigate({
        search: (previous) => ({
          ...previous,
          q: value || undefined,
          page: undefined,
        }),
      })
    },
    [currentSearch, navigate],
  )

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useNFTs({
    search: currentSearch || undefined,
    ...sortOptions[sort],
    page,
    pageSize: PAGE_SIZE,
    ...(favoritesOnly
      ? {
          favoritesOnly: true,
          favoriteIds: favorites,
        }
      : {}),
  })

  function handleSortChange(value: SortOption) {
    void navigate({
      search: (previous) => ({
        ...previous,
        sort: value === "newest" ? undefined : value,
        page: undefined,
      }),
    })
  }

  function handlePageChange(nextPage: number) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: nextPage === 1 ? undefined : nextPage,
      }),
    })
  }

  function handleFavoritesFilterChange(value: boolean) {
    setFavoritesOnly(value)

    void navigate({
      search: (previous) => ({
        ...previous,
        page: undefined,
      }),
    })
  }

  function handleToggleFavorite(nftId: string) {
    if (favorites.includes(nftId)) {
      removeFavorite(nftId)
      return
    }

    addFavorite(nftId)
  }

  if (isPending) {
    return (
      <>
        <AppHeader />
        <main className="p-8">
          <p>Carregando NFTs...</p>
        </main>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <AppHeader />
        <main className="space-y-4 p-8">
          <p>Erro ao carregar NFTs: {error.message}</p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Tentar novamente
          </button>
        </main>
      </>
    )
  }

  const totalPages = data.totalPages

  const firstResult =
    data.totalItems === 0
      ? 0
      : (data.page - 1) * data.pageSize + 1

  const lastResult =
    (data.page - 1) * data.pageSize + data.items.length

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  return (
    <>
      <AppHeader />

      <main className="min-h-screen space-y-6 bg-background p-8 text-foreground">
        <h1 className="text-3xl font-bold">
          NFT Marketplace
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            Exibindo {firstResult}–{lastResult} de{" "}
            {data.totalItems} NFTs.
          </p>

          {isFetching && (
            <span className="text-sm text-muted-foreground">
              Atualizando resultados...
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <SearchInput
            key={currentSearch}
            initialValue={currentSearch}
            onSearch={handleSearch}
          />

          <select
            aria-label="Ordenar NFTs"
            value={sort}
            onChange={(event) =>
              handleSortChange(event.target.value as SortOption)
            }
            className="rounded-md border border-border bg-card px-4 py-2 text-foreground outline-none focus:border-primary"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="priceAsc">Menor preço</option>
            <option value="priceDesc">Maior preço</option>
            <option value="nameAsc">Nome (A-Z)</option>
          </select>

          {isAuthenticated && (
            <div
              className="flex rounded-md border border-border p-1"
              aria-label="Filtrar NFTs"
            >
              <button
                type="button"
                onClick={() => handleFavoritesFilterChange(false)}
                aria-pressed={!favoritesOnly}
                className={`rounded px-4 py-2 transition ${
                  !favoritesOnly
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Todos
              </button>

              <button
                type="button"
                onClick={() => handleFavoritesFilterChange(true)}
                aria-pressed={favoritesOnly}
                className={`rounded px-4 py-2 transition ${
                  favoritesOnly
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                ♥ Favoritos ({favorites.length})
              </button>
            </div>
          )}
        </div>

        {data.items.length === 0 ? (
          <div className="space-y-3 py-8">
            <p>
              {favoritesOnly
                ? "Você ainda não possui NFTs favoritos."
                : "Nenhum NFT encontrado."}
            </p>

            {favoritesOnly ? (
              <button
                type="button"
                onClick={() => handleFavoritesFilterChange(false)}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Ver todos os NFTs
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((nft) => {
                const isFavorite = favorites.includes(nft.id)

                return (
                  <article
                    key={nft.id}
                    className="space-y-2 rounded-lg border border-border bg-card p-4 transition hover:border-primary"
                  >
                    <Link
                      to="/nft/$nftId"
                      params={{ nftId: nft.id }}
                      className="block space-y-2"
                    >
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="h-64 w-full rounded-md object-cover"
                      />

                      <h2 className="font-semibold">
                        {nft.name}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        {nft.collection.name}
                      </p>

                      <p className="font-medium">
                        {nft.price} ETH
                      </p>
                    </Link>

                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(nft.id)}
                        disabled={isUpdating}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remover ${nft.name} dos favoritos`
                            : `Adicionar ${nft.name} aos favoritos`
                        }
                        className="w-full rounded-md border border-border px-3 py-2 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isFavorite
                          ? "♥ Remover dos favoritos"
                          : "♡ Adicionar aos favoritos"}
                      </button>
                    )}
                  </article>
                )
              })}
            </section>

            {totalPages > 1 && (
              <nav
                aria-label="Paginação"
                className="flex flex-wrap items-center justify-center gap-2 pt-4"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-md border border-border px-4 py-2 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={
                      pageNumber === page ? "page" : undefined
                    }
                    className={`min-w-10 rounded-md border px-3 py-2 transition ${
                      pageNumber === page
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-md border border-border px-4 py-2 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próximo
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  )
}
