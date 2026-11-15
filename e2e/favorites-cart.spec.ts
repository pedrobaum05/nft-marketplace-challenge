
import { expect, test } from "@playwright/test"

async function registerUser(page: import("@playwright/test").Page) {
  const email = `teste-${crypto.randomUUID()}@example.com`

  await page.goto("/register")

  await page.getByLabel("Nome").fill("Usuário de Teste")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha", { exact: true }).fill("Teste123!")
  await page.getByLabel("Confirmar senha").fill("Teste123!")

  await page.getByRole("button", { name: "Criar conta" }).click()
  await expect(page).toHaveURL("/")
}

test.describe("Favoritos", () => {
  test("deve adicionar e filtrar um NFT favorito", async ({ page }) => {
    await registerUser(page)

    await page
      .getByRole("button", {
        name: "Adicionar Cosmic Guardian aos favoritos",
      })
      .click()

    await expect(
      page.getByRole("button", {
        name: "Remover Cosmic Guardian dos favoritos",
      }),
    ).toBeVisible()

    await page.getByRole("button", { name: /Favoritos/ }).click()

    await expect(
      page.getByRole("article").filter({
        has: page.getByRole("button", {
          name: "Remover Cosmic Guardian dos favoritos",
        }),
      }),
    ).toBeVisible()
  })

  test("deve remover um NFT dos favoritos", async ({ page }) => {
    await registerUser(page)

    await page
      .getByRole("button", {
        name: "Adicionar Cosmic Guardian aos favoritos",
      })
      .click()

    await page
      .getByRole("button", {
        name: "Remover Cosmic Guardian dos favoritos",
      })
      .click()

    await page.getByRole("button", { name: /Favoritos/ }).click()

    await expect(
      page.getByText("Você ainda não possui NFTs favoritos."),
    ).toBeVisible()
  })
})

test.describe("Carrinho", () => {
  test("deve adicionar um NFT ao carrinho", async ({ page }) => {
    await page.goto("/nft/nft-001")

    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click()

    await expect(page.getByRole("status")).toContainText(
      "NFT adicionado ao carrinho com sucesso.",
    )

    await page.goto("/cart")

    await expect(
      page.getByRole("heading", { name: "Meu carrinho" }),
    ).toBeVisible()

    await expect(page.getByText("Cosmic Guardian")).toBeVisible()
  })

  test("deve remover um NFT e exibir o carrinho vazio", async ({ page }) => {
    await page.goto("/nft/nft-001")

    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click()

    await page.goto("/cart")

    await page.getByRole("button", { name: "Remover" }).click()

    await expect(
      page.getByText("Seu carrinho está vazio"),
    ).toBeVisible()
  })
})
