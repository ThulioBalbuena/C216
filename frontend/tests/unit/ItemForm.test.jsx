import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ItemForm from "../../src/components/ItemForm.jsx";

describe("ItemForm", () => {
  it("envia o item sem espaços nas pontas e limpa os campos", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/nome/i), "  Caderno  ");
    await user.type(screen.getByLabelText(/descrição/i), "  Capa azul  ");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      name: "Caderno",
      description: "Capa azul",
    });
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
    expect(screen.getByLabelText(/descrição/i)).toHaveValue("");
  });

  it("aceita item sem descrição", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/nome/i), "Caderno");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(onAdd).toHaveBeenCalledWith({ name: "Caderno", description: "" });
  });

  it("não envia e mostra erro quando o nome está vazio", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );
    expect(screen.getByLabelText(/nome/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("remove o erro do nome quando o usuário volta a digitar", async () => {
    const user = userEvent.setup();
    render(<ItemForm onAdd={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/nome/i), "C");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("não envia e mostra erro quando a descrição é longa demais", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/nome/i), "Caderno");
    await user.click(screen.getByLabelText(/descrição/i));
    await user.paste("a".repeat(1001));
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A descrição deve ter no máximo 1000 caracteres.",
    );
  });
});
