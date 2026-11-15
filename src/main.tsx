
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"

import "./index.css"

import { queryClient } from "./lib/query-client"

async function enableMocking(): Promise<void> {
  const { worker } = await import("./mocks/browser")

  await worker.start({
    onUnhandledRequest: "warn",
  })
}

async function bootstrap(): Promise<void> {
  await enableMocking()

  const { router } = await import("./router")

  const rootElement = document.getElementById("root")

  if (!rootElement) {
    throw new Error("Elemento root não encontrado no HTML.")
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap().catch((error: unknown) => {
  console.error("Falha ao inicializar a aplicação:", error)
})
