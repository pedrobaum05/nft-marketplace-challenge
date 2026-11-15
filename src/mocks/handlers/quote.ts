
import { http, HttpResponse } from "msw"

import { getActiveSession } from "./auth"
import { getStoredQuote } from "./checkout"

export const quoteHandlers = [
  http.get("/api/checkout/quote/:quoteId", ({ params }) => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      )
    }

    const quoteId = String(params.quoteId)
    const storedQuote = getStoredQuote(quoteId)

    if (!storedQuote || storedQuote.userId !== session.user.id) {
      return HttpResponse.json(
        { message: "Cotação não encontrada." },
        { status: 404 },
      )
    }

    return HttpResponse.json(storedQuote.quote)
  }),
]
