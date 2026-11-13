
import { Button } from "@/components/ui/button"

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-primary">
          NFT Marketplace
        </h1>

        <p className="text-sm text-muted-foreground">
          Fundação do projeto em construção.
        </p>

        <Button>Testar componente</Button>
      </section>
    </main>
  )
}

export default App
