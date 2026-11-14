
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"

import "./index.css"
import { queryClient } from "@/lib/query-client"
import { router } from "@/router"

async function enableMocking() {
  const { worker } = await import("./mocks/browser")

  await worker.start({
    onUnhandledRequest: "warn",
  })
}

async function bootstrap() {
  await enableMocking()

  createRoot(document.getElementById("root")!).render(
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
