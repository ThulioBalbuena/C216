import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.jsx";

async function addItem(user, name, description = "") {
  await user.clear(screen.getByLabelText(/preço/i));
  await user.type(screen.getByLabelText(/preço/i), "10");
  const nameField = screen.getByLabelText(/nome/i);
  const descriptionField = screen.getByLabelText(/descrição/i);
  if (name) {
    await user.type(nameField, name);
  }
  if (description) {
    await user.type(descriptionField, description);
  }
  await user.click(screen.getByRole("button", { name: "Adicionar item" }));
}

describe("App (formulário + lista)", () => {
  let fetchMock;
  beforeEach(() => {
    let nextId = 1;
    fetchMock = vi.fn(async (_url, options) => {
      if (options.method === "POST") {
        return Response.json({ id: nextId++, ...JSON.parse(options.body) });
      }
      return Response.json([]);
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra carregamento e depois a lista vazia", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Gerenciador de itens" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando itens");
    expect(
      await screen.findByRole("heading", { name: "Itens cadastrados (0)" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/nenhum item cadastrado/i)).toBeInTheDocument();
  });

  it("cadastra um item e mostra na lista com nome e descrição", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addItem(user, "Caderno", "Capa azul");

    const list = await screen.findByRole("list");
    expect(within(list).getByText("Caderno")).toBeInTheDocument();
    expect(within(list).getByText("Capa azul")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Itens cadastrados (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/nenhum item cadastrado/i),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
    expect(screen.getByLabelText(/descrição/i)).toHaveValue("");
  });

  it("mantém a ordem de cadastro ao adicionar vários itens", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addItem(user, "Caderno", "Capa azul");
    await addItem(user, "Caneta");
    await addItem(user, "Lápis", "HB");

    const entries = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(entries).toHaveLength(3);
    expect(entries[0]).toHaveTextContent("Caderno");
    expect(entries[1]).toHaveTextContent("Caneta");
    expect(entries[2]).toHaveTextContent("Lápis");
    expect(
      screen.getByRole("heading", { name: "Itens cadastrados (3)" }),
    ).toBeInTheDocument();
  });

  it("mostra erro de validação e não cadastra quando o nome está vazio", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addItem(user, "", "Só descrição");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Itens cadastrados (0)" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toHaveValue("Só descrição");
  });

  it("permite corrigir o erro e cadastrar em seguida", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addItem(user, "   ");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );

    await user.clear(screen.getByLabelText(/nome/i));
    await user.type(screen.getByLabelText(/nome/i), "Caderno");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(
      within(await screen.findByRole("list")).getByText("Caderno"),
    ).toBeInTheDocument();
  });

  it("mostra o erro da API e mantém os campos se o nome já existe", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/nenhum item cadastrado/i);
    fetchMock.mockResolvedValueOnce(
      Response.json(
        { detail: "Já existe um item com esse nome" },
        { status: 409 },
      ),
    );

    await addItem(user, "Caderno", "Capa azul");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe um item com esse nome",
    );
    expect(screen.getByLabelText(/nome/i)).toHaveValue("Caderno");
    expect(screen.getByLabelText(/descrição/i)).toHaveValue("Capa azul");
  });

  it("mostra mensagem quando não consegue conectar à API", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar à API.",
    );
  });
});
