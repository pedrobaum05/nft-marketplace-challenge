
import { expect, test } from "@playwright/test"

test("catálogo deve carregar e exibir o campo de pesquisa", async ({
  page,
}) => {
  await page.goto("/")

  const searchInput = page.getByPlaceholder("Pesquisar NFTs...")

  await expect(searchInput).toBeVisible()
})
