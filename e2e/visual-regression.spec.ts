
import { randomUUID } from "node:crypto"
import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

async function registerUser(page: Page): Promise<void> {
  await page.goto("/register")

  await page.getByLabel("Nome").fill("Usuário Visual")
  await page.getByLabel("E-mail").fill(`visual-${randomUUID()}@example.com`)
  await page.getByLabel("Senha", { exact: true }).fill("Teste123!")
  await page.getByLabel("Confirmar senha").fill("Teste123!")

  await page.getByRole("button", { name: "Criar conta" }).click()

  await expect(page).toHaveURL("/")
}

async function connectWallet(page: Page): Promise<void> {
  await page.goto("/account")

  await page.getByLabel("Nome da carteira").fill("Carteira Visual")
  await page.getByLabel("Endereço da carteira").fill(`0x${"1".repeat(40)}`)
  await page.getByRole("button", { name: "Conectar carteira" }).click()

  await expect(page.getByRole("status")).toHaveText(
    "Carteira conectada com sucesso.",
  )
}

async function addNftToCart(page: Page): Promise<void> {
  await page.goto("/nft/nft-001")

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click()

  await expect(page.getByRole("status")).toContainText(
    "NFT adicionado ao carrinho com sucesso.",
  )
}

async function preparePayment(page: Page): Promise<void> {
  await registerUser(page)
  await connectWallet(page)
  await addNftToCart(page)

  await page.goto("/cart")
  await page.getByRole("button", { name: "Gerar cotação" }).click()

  const checkoutLink = page.getByRole("link", {
    name: "Continuar para pagamento",
  })

  await expect(checkoutLink).toBeVisible()
  await checkoutLink.click()

  await expect(
    page.getByRole("heading", { name: "Finalizar compra" }),
  ).toBeVisible()

  await page.locator('input[name="wallet"]').first().check()

  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled()
}

async function captureVisual(page: Page, name: string): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready

    const images = Array.from(document.images)

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true })
            image.addEventListener("error", () => resolve(), { once: true })
          })
        }

        if (typeof image.decode === "function") {
          await image.decode().catch(() => undefined)
        }
      }),
    )
  })

  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: "disabled",
    caret: "hide",
    timeout: 15000,
    mask: [page.getByText(/Cotação válida até/i)],
  })
}

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const

for (const viewport of viewports) {
  test.describe(`Regressão visual - ${viewport.name}`, () => {
    test.use({
      viewport: {
        width: viewport.width,
        height: viewport.height,
      },
    })

    test("catálogo", async ({ page }) => {
      await page.goto("/")

      await expect(
        page.getByRole("heading", { name: /NFT/i }).first(),
      ).toBeVisible()

      await captureVisual(page, `${viewport.name}-catalog.png`)
    })

    test("detalhes do NFT", async ({ page }) => {
      await page.goto("/nft/nft-001")

      await expect(
        page.getByRole("button", { name: "Adicionar ao carrinho" }),
      ).toBeVisible()

      await captureVisual(page, `${viewport.name}-detail.png`)
    })

    test("carrinho", async ({ page }) => {
      await registerUser(page)
      await addNftToCart(page)
      await page.goto("/cart")

      await expect(
        page.getByRole("button", { name: "Gerar cotação" }),
      ).toBeVisible()

      await captureVisual(page, `${viewport.name}-cart.png`)
    })

    test("pagamento", async ({ page }) => {
      await preparePayment(page)

      await expect(page.getByText("Taxa de rede")).toBeVisible()

      await captureVisual(page, `${viewport.name}-payment.png`)
    })
  })
}
