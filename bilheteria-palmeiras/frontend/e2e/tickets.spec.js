import { expect, test } from "@playwright/test";

test("confirma um pedido e consulta o comprovante", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Ver setores de Palmeiras e Santos" })
    .click();
  await page
    .getByRole("group", { name: "Setores disponíveis" })
    .getByRole("button", { name: /Gol Norte/ })
    .click();
  await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();

  await expect(
    page.getByRole("heading", { name: "Revise seu pedido" }),
  ).toBeVisible();
  await expect(page.getByText("2 ingressos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  await expect(
    page.getByRole("heading", { name: "Pedido confirmado" }),
  ).toBeVisible();
  const receipt = page
    .getByRole("status")
    .filter({ hasText: "Código do pedido" });
  await expect(receipt).toHaveText(/BP-/);
  const confirmation = await receipt.textContent();

  await page.reload();
  await page.getByRole("link", { name: "Ver meus ingressos" }).click();
  await page.getByRole("link", { name: "Ver confirmação" }).click();
  await expect(receipt).toHaveText(confirmation);
});
