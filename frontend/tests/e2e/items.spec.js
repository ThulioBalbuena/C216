import { expect, test } from "@playwright/test";

test.describe("Gerenciador de itens", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mostra a página com a lista vazia", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Gerenciador de itens" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Itens cadastrados (0)" }),
    ).toBeVisible();
    await expect(page.getByText("Nenhum item cadastrado.")).toBeVisible();
  });

  test("mostra erro ao tentar cadastrar com o nome vazio", async ({ page }) => {
    await page.getByRole("button", { name: "Adicionar item" }).click();

    await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
    await expect(
      page.getByRole("heading", { name: "Itens cadastrados (0)" }),
    ).toBeVisible();
    await expect(page.getByRole("list")).toHaveCount(0);
  });

  test("cadastra um item e mostra na lista", async ({ page }) => {
    await page.getByLabel("Nome").fill("Caderno");
    await page.getByLabel("Descrição").fill("Capa azul");
    await page.getByRole("button", { name: "Adicionar item" }).click();

    const list = page.getByRole("list");
    await expect(list.getByText("Caderno")).toBeVisible();
    await expect(list.getByText("Capa azul")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Itens cadastrados (1)" }),
    ).toBeVisible();
    await expect(page.getByLabel("Nome")).toHaveValue("");
    await expect(page.getByLabel("Descrição")).toHaveValue("");
  });

  test("corrige o erro de validação e cadastra o item", async ({ page }) => {
    await page.getByRole("button", { name: "Adicionar item" }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    await page.getByLabel("Nome").fill("Caneta");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.getByRole("button", { name: "Adicionar item" }).click();

    await expect(page.getByRole("list").getByText("Caneta")).toBeVisible();
  });

  test.describe("em tela de celular", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("cadastra um item sem rolagem horizontal", async ({ page }) => {
      await page
        .getByLabel("Nome")
        .fill("Caderno com um nome bem comprido para testar quebra de linha");
      await page.getByRole("button", { name: "Adicionar item" }).click();

      await expect(
        page.getByRole("list").getByText(/Caderno com um nome/),
      ).toBeVisible();
      const hasHorizontalScroll = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(hasHorizontalScroll).toBe(false);
    });
  });
});
