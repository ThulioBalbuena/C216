import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { SectorSelection } from "./SectorSelection";

afterEach(cleanup);

const sectors = [
  {
    id: 1,
    name: "Gol Norte",
    description: "Atrás do gol",
    remaining: 8,
    price_cents: 8000,
  },
  {
    id: 2,
    name: "Central Leste",
    description: "Vista lateral",
    remaining: 2,
    price_cents: 12000,
  },
  {
    id: 3,
    name: "Gol Sul",
    description: "Vista do gol",
    remaining: 0,
    price_cents: 7500,
  },
  {
    id: 4,
    name: "Superior Oeste",
    description: "Vista panorâmica",
    remaining: 10,
    price_cents: 9500,
  },
  {
    id: 5,
    name: "Superior Leste",
    description: "Vista panorâmica",
    remaining: 10,
    price_cents: 9500,
  },
];

test("bloqueia setor esgotado e sincroniza a seleção do mapa com a lista", async () => {
  const user = userEvent.setup();
  render(<SectorSelection sectors={sectors} />);

  const list = within(
    screen.getByRole("group", { name: "Setores disponíveis" }),
  );
  expect(
    screen.getByRole("button", { name: "Gol Sul", exact: true }).disabled,
  ).toBe(true);
  expect(list.getByRole("button", { name: /Gol Sul.*Esgotado/ }).disabled).toBe(
    true,
  );

  const upperEastOnMap = screen.getByRole("button", {
    name: "Superior Leste",
    exact: true,
  });
  await user.click(upperEastOnMap);
  expect(upperEastOnMap.getAttribute("aria-pressed")).toBe("true");
  expect(
    list
      .getByRole("button", { name: /Superior Leste/ })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});

test("limita a quantidade a quatro e reduz o total ao trocar para um setor com menos vagas", async () => {
  const user = userEvent.setup();
  render(<SectorSelection sectors={sectors} />);

  const increase = screen.getByRole("button", { name: "Aumentar quantidade" });
  const quantity = screen.getByLabelText("Quantidade de ingressos");
  await user.click(
    screen.getByRole("button", { name: "Gol Norte", exact: true }),
  );
  await user.tripleClick(increase);
  expect(quantity.textContent).toBe("4");
  expect(increase.disabled).toBe(true);

  await user.click(
    screen.getByRole("button", { name: "Central Leste", exact: true }),
  );
  expect(quantity.textContent).toBe("2");
  expect(increase.disabled).toBe(true);
  expect(screen.getByText(/R\$\s*240,00/)).toBeTruthy();
});
