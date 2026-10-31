import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.jsx";

async function addItem(user, name, description = "") {
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("começa com a lista vazia", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Gerenciador de itens" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Itens cadastrados (0)" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/nenhum item cadastrado/i)).toBeInTheDocument();
  });

  it("cadastra um item e mostra na lista com nome e descrição", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addItem(user, "Caderno", "Capa azul");

    const list = screen.getByRole("list");
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
      within(screen.getByRole("list")).getByText("Caderno"),
    ).toBeInTheDocument();
  });

  it("não faz nenhuma chamada de rede ao cadastrar", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await addItem(user, "Caderno", "Capa azul");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
