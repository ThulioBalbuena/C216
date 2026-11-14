import { expect, test } from "@playwright/test";

test("cadastra pela API, mantém após recarregar e rejeita nome repetido", async ({
  page,
}) => {
  const name = `Caderno ${Date.now()}`;
  const apiRequest = (request) => new URL(request.url()).pathname === "/items";
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gerenciador de itens" }),
  ).toBeVisible();

  async function fillItem() {
    await page.getByLabel("Nome").fill(name);
    await page.getByLabel("Preço").fill("10");
    await page.getByLabel("Descrição").fill("Capa azul");
  }

  await fillItem();
  const created = page.waitForResponse(
    (response) =>
      apiRequest(response.request()) && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Adicionar item" }).click();
  const response = await created;
  expect(response.headers()["access-control-allow-origin"]).toBe(
    new URL(page.url()).origin,
  );
  expect(response.status()).toBe(201);
  await expect(
    page.getByRole("list").getByText(name, { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("");

  await page.reload();
  await expect(
    page.getByRole("list").getByText(name, { exact: true }),
  ).toBeVisible();

  await fillItem();
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Já existe um item com esse nome",
  );
  await expect(page.getByLabel("Nome")).toHaveValue(name);
});
