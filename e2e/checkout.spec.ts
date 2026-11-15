
import { randomUUID } from "node:crypto"
import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

async function prepareCheckout(page: Page): Promise<void> {
  // Cadastro do usuário
  await page.goto("/register")

  await page.getByLabel("Nome").fill("Usuário E2E")
  await page.getByLabel("E-mail").fill(`teste-${randomUUID()}@example.com`)
  await page.getByLabel("Senha", { exact: true }).fill("Teste123!")
  await page.getByLabel("Confirmar senha").fill("Teste123!")

  await page.getByRole("button", { name: "Criar conta" }).click()
  await expect(page).toHaveURL("/")

  // Cadastro da carteira
  await page.goto("/account")

  await page.getByLabel("Nome da carteira").fill("Carteira E2E")
  await page
    .getByLabel("Endereço da carteira")
    .fill(`0x${randomUUID().replaceAll("-", "")}`)

  await page.getByRole("button", { name: "Conectar carteira" }).click()

  await expect(page.getByRole("status")).toHaveText(
    "Carteira conectada com sucesso.",
  )

  // Adição do NFT ao carrinho
  await page.goto("/nft/nft-001")

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click()

  await expect(page.getByRole("status")).toContainText(
    "NFT adicionado ao carrinho com sucesso.",
  )

  // Geração da cotação
  await page.goto("/cart")

  await page.getByRole("button", { name: "Gerar cotação" }).click()

  const checkoutLink = page.getByRole("link", {
    name: "Continuar para pagamento",
  })

  await expect(checkoutLink).toBeVisible()
  await checkoutLink.click()

  // Seleção da carteira no checkout
  const walletRadio = page.locator('input[name="wallet"]').first()

  await expect(walletRadio).toBeVisible()
  await walletRadio.check()
}

test.describe("Checkout e pedidos", () => {
  test("deve confirmar uma compra e limpar o carrinho", async ({ page }) => {
    await prepareCheckout(page)

    await page.getByRole("button", { name: "Confirmar compra" }).click()

    await expect(
      page.getByText("Pagamento pendente. Aguardando confirmação."),
    ).toBeVisible()

    await page.getByRole("button", { name: "Simular aprovação" }).click()

    await expect(
      page.getByText("Compra confirmada com sucesso!"),
    ).toBeVisible()

    await page.goto("/cart")

    await expect(
      page.getByText("Seu carrinho está vazio"),
    ).toBeVisible()
  })

  test("deve permitir uma nova tentativa após recusa", async ({ page }) => {
    await prepareCheckout(page)

    await page.getByRole("button", { name: "Confirmar compra" }).click()

    await expect(
      page.getByText("Pagamento pendente. Aguardando confirmação."),
    ).toBeVisible()

    await page.getByRole("button", { name: "Simular recusa" }).click()

    await expect(page.getByText("O pedido foi recusado.")).toBeVisible()

    await page.getByRole("button", { name: "Tentar novamente" }).click()

    await page.getByRole("button", { name: "Confirmar compra" }).click()

    await expect(
      page.getByText("Pagamento pendente. Aguardando confirmação."),
    ).toBeVisible()

    await page.getByRole("button", { name: "Simular aprovação" }).click()

    await expect(
      page.getByText("Compra confirmada com sucesso!"),
    ).toBeVisible()
  })

  test("deve exibir o status pendente antes da confirmação", async ({
    page,
  }) => {
    await prepareCheckout(page)

    await page.getByRole("button", { name: "Confirmar compra" }).click()

    await expect(
      page.getByText("Pagamento pendente. Aguardando confirmação."),
    ).toBeVisible()
  })
})
