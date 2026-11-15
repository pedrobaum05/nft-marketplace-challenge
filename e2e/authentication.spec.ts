
import { randomUUID } from "node:crypto"
import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

function createTestEmail(): string {
  return `teste-${randomUUID()}@example.com`
}

async function registerUser(page: Page, email: string): Promise<void> {
  await page.goto("/register")

  await page.getByLabel("Nome").fill("Usuário E2E")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha", { exact: true }).fill("SenhaTeste123!")
  await page.getByLabel("Confirmar senha").fill("SenhaTeste123!")

  await page.locator("form").getByRole("button").click()
}

test.describe("Autenticação", () => {
  test("deve cadastrar um novo usuário", async ({ page }) => {
    const email = createTestEmail()

    await registerUser(page, email)

    await expect(page).toHaveURL("/")
    await expect(
      page.getByRole("button", { name: "Sair" }),
    ).toBeVisible()
  })

  test("deve impedir cadastro com senhas diferentes", async ({ page }) => {
    await page.goto("/register")

    await page.getByLabel("Nome").fill("Usuário E2E")
    await page.getByLabel("E-mail").fill(createTestEmail())
    await page.getByLabel("Senha", { exact: true }).fill("SenhaTeste123!")
    await page.getByLabel("Confirmar senha").fill("SenhaDiferente123!")

    await page.locator("form").getByRole("button").click()

    await expect(page.getByRole("alert")).toHaveText(
      "As senhas não coincidem.",
    )
  })

  test("deve impedir cadastro com e-mail duplicado", async ({ page }) => {
    const email = createTestEmail()

    await registerUser(page, email)

    await expect(
      page.getByRole("button", { name: "Sair" }),
    ).toBeVisible()

    await page.getByRole("button", { name: "Sair" }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto("/register")

    await page.getByLabel("Nome").fill("Segundo Usuário")
    await page.getByLabel("E-mail").fill(email)
    await page.getByLabel("Senha", { exact: true }).fill("SenhaTeste123!")
    await page.getByLabel("Confirmar senha").fill("SenhaTeste123!")

    await page.locator("form").getByRole("button").click()

    await expect(page.getByRole("alert")).toHaveText(
      "Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.",
    )
  })

  test("deve rejeitar login com credenciais inválidas", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("E-mail").fill("invalido@example.com")
    await page.getByLabel("Senha", { exact: true }).fill("SenhaIncorreta123!")

    await page.locator("form").getByRole("button").click()

    await expect(page.getByRole("alert")).toHaveText(
      "Não foi possível entrar. Verifique seu e-mail e sua senha.",
    )
  })

  test("deve proteger a rota da conta e permitir logout", async ({ page }) => {
    await page.goto("/account")

    await expect(page).toHaveURL(/\/login$/)

    await registerUser(page, createTestEmail())

    await expect(
      page.getByRole("button", { name: "Sair" }),
    ).toBeVisible()

    await page.getByRole("button", { name: "Sair" }).click()

    await expect(page).toHaveURL(/\/login$/)

    await expect(
      page.getByRole("button", { name: "Entrar" }),
    ).toBeVisible()

    await page.goto("/account")

    await expect(page).toHaveURL(/\/login$/)
  })
})
