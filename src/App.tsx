
import { useNFTs } from "@/hooks/use-nfts"

function App() {
  const { data, isPending, isError, error, refetch } = useNFTs()

  if (isPending) {
    return <main className="p-8">Carregando NFTs...</main>
  }

  if (isError) {
    return (
      <main className="space-y-4 p-8">
        <p>Erro ao carregar NFTs: {error.message}</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </main>
    )
  }

  if (data.items.length === 0) {
    return <main className="p-8">Nenhum NFT encontrado.</main>
  }

  return (
    <main className="min-h-screen space-y-6 bg-background p-8 text-foreground">
      <h1 className="text-3xl font-bold text-primary">
        NFT Marketplace
      </h1>

      <p>
        Exibindo {data.items.length} de {data.totalItems} NFTs.
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((nft) => (
          <article
            key={nft.id}
            className="space-y-2 rounded-lg border border-border bg-card p-4"
          >
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="aspect-square w-full rounded-md object-cover"
            />

            <h2 className="font-bold">{nft.name}</h2>
            <p className="text-sm text-muted-foreground">
              {nft.collection.name}
            </p>
            <p className="font-medium text-primary">
              {nft.price} ETH
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
