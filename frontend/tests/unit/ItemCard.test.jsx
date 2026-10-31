import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ItemCard from "../../src/components/ItemCard.jsx";

describe("ItemCard", () => {
  it("mostra o nome e a descrição", () => {
    render(<ItemCard name="Caderno" description="Capa azul" />);

    expect(
      screen.getByRole("heading", { name: "Caderno" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Capa azul")).toBeInTheDocument();
  });

  it("não mostra parágrafo de descrição quando ela está vazia", () => {
    render(<ItemCard name="Caderno" description="" />);

    expect(
      screen.getByRole("heading", { name: "Caderno" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Capa azul")).not.toBeInTheDocument();
    expect(screen.getByRole("article").querySelector("p")).toBeNull();
  });
});
