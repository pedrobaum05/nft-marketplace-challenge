
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AccountPage } from "@/pages/account-page"
import { CartPage } from "@/pages/cart-page"
import { CatalogPage } from "@/pages/catalog-page"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { NFTDetailRoute } from "@/router/nft-detail-route"

const sortOptions = [
  "newest",
  "oldest",
  "priceAsc",
  "priceDesc",
  "nameAsc",
] as const

export type CatalogSort = (typeof sortOptions)[number]

export interface CatalogSearch {
  q?: string
  sort?: CatalogSort
  page?: number
}

function validateCatalogSearch(
  search: Record<string, unknown>,
): CatalogSearch {
  const q = typeof search.q === "string" ? search.q : undefined

  const sort = sortOptions.includes(search.sort as CatalogSort)
    ? (search.sort as CatalogSort)
    : undefined

  const parsedPage = Number(search.page)

  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : undefined

  return { q, sort, page }
}

const rootRoute = createRootRoute()

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: validateCatalogSearch,
  component: CatalogPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
})

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: () => (
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  ),
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
})

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: NFTDetailRoute,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  accountRoute,
  cartRoute,
  nftDetailRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
