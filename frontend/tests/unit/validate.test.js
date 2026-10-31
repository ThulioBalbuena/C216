import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  validateDescription,
  validateItem,
  validateName,
} from "../../src/validate.js";

describe("validateName", () => {
  it("aceita um nome válido", () => {
    expect(validateName("Caderno")).toBe("");
  });

  it("rejeita nome vazio, só com espaços ou ausente", () => {
    expect(validateName("")).toBe("O nome é obrigatório.");
    expect(validateName("   ")).toBe("O nome é obrigatório.");
    expect(validateName(undefined)).toBe("O nome é obrigatório.");
    expect(validateName(null)).toBe("O nome é obrigatório.");
  });

  it("aceita nome com exatamente o tamanho máximo", () => {
    expect(validateName("a".repeat(NAME_MAX_LENGTH))).toBe("");
  });

  it("rejeita nome acima do tamanho máximo", () => {
    expect(validateName("a".repeat(NAME_MAX_LENGTH + 1))).toBe(
      "O nome deve ter no máximo 100 caracteres.",
    );
  });

  it("ignora espaços nas pontas ao contar caracteres", () => {
    expect(validateName(`  ${"a".repeat(NAME_MAX_LENGTH)}  `)).toBe("");
  });
});

describe("validateDescription", () => {
  it("aceita descrição vazia ou ausente, pois é opcional", () => {
    expect(validateDescription("")).toBe("");
    expect(validateDescription(undefined)).toBe("");
  });

  it("aceita descrição com exatamente o tamanho máximo", () => {
    expect(validateDescription("a".repeat(DESCRIPTION_MAX_LENGTH))).toBe("");
  });

  it("rejeita descrição acima do tamanho máximo", () => {
    expect(validateDescription("a".repeat(DESCRIPTION_MAX_LENGTH + 1))).toBe(
      "A descrição deve ter no máximo 1000 caracteres.",
    );
  });
});

describe("validateItem", () => {
  it("retorna objeto vazio quando o item é válido", () => {
    expect(validateItem({ name: "Caderno", description: "Capa azul" })).toEqual(
      {},
    );
  });

  it("retorna erro apenas do campo inválido", () => {
    expect(validateItem({ name: "", description: "Capa azul" })).toEqual({
      name: "O nome é obrigatório.",
    });
    expect(
      validateItem({
        name: "Caderno",
        description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1),
      }),
    ).toEqual({
      description: "A descrição deve ter no máximo 1000 caracteres.",
    });
  });

  it("retorna os erros dos dois campos quando ambos são inválidos", () => {
    const errors = validateItem({
      name: " ",
      description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1),
    });
    expect(Object.keys(errors)).toEqual(["name", "description"]);
  });
});
