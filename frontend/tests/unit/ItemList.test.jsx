import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ItemList from "../../src/components/ItemList.jsx";

describe("ItemList", () => {
  it("mostra a mensagem de lista vazia quando não há itens", () => {
    render(<ItemList items={[]} />);

    expect(
      screen.getByRole("heading", { name: "Itens cadastrados (0)" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/nenhum item cadastrado/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("mostra um card para cada item, na ordem recebida", () => {
    const items = [
      { id: 1, name: "Caderno", description: "Capa azul" },
      { id: 2, name: "Caneta", description: "" },
    ];
    render(<ItemList items={items} />);

    expect(
      screen.getByRole("heading", { name: "Itens cadastrados (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/nenhum item cadastrado/i),
    ).not.toBeInTheDocument();

    const entries = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(entries).toHaveLength(2);
    expect(within(entries[0]).getByText("Caderno")).toBeInTheDocument();
    expect(within(entries[0]).getByText("Capa azul")).toBeInTheDocument();
    expect(within(entries[1]).getByText("Caneta")).toBeInTheDocument();
  });
});
