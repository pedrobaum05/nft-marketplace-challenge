
import { expect, test } from "@playwright/test"

test.describe("Catálogo de NFTs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("deve exibir NFTs no catálogo", async ({ page }) => {
    const cosmicGuardian = page
      .locator("article")
      .filter({ hasText: "Cosmic Guardian" })

    const neonDreams = page
      .locator("article")
      .filter({ hasText: "Neon Dreams" })

    await expect(cosmicGuardian.first()).toBeVisible()
    await expect(neonDreams.first()).toBeVisible()
  })

  test("deve pesquisar NFTs e atualizar a URL", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Pesquisar NFTs...")

    await searchInput.fill("Cosmic Guardian")

    const cosmicGuardian = page
      .locator("article")
      .filter({ hasText: "Cosmic Guardian" })

    const digitalHorizon = page
      .locator("article")
      .filter({ hasText: "Digital Horizon" })

    await expect(cosmicGuardian.first()).toBeVisible()
    await expect(digitalHorizon).toHaveCount(0)

    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe("Cosmic Guardian")
  })

  test("deve alterar a ordenação dos NFTs", async ({ page }) => {
    const sortSelect = page.getByLabel("Ordenar NFTs")

    await sortSelect.selectOption("priceAsc")

    await expect(sortSelect).toHaveValue("priceAsc")

    await expect
      .poll(() => new URL(page.url()).searchParams.get("sort"))
      .toBe("priceAsc")

    await expect(page.locator("article").first()).toContainText(
      "Pixel Kingdom",
    )
  })

  test("deve avançar para a próxima página", async ({ page }) => {
    await page.getByRole("button", { name: "Próximo" }).click()

    await expect
      .poll(() => new URL(page.url()).searchParams.get("page"))
      .toBe("2")

    await expect(
      page.getByRole("button", { name: "Anterior" }),
    ).toBeVisible()
  })
})
