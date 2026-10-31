export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 1000;

export function validateName(name) {
  const value = (name ?? "").trim();
  if (value.length === 0) {
    return "O nome é obrigatório.";
  }
  if (value.length > NAME_MAX_LENGTH) {
    return `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`;
  }
  return "";
}

export function validateDescription(description) {
  const value = (description ?? "").trim();
  if (value.length > DESCRIPTION_MAX_LENGTH) {
    return `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  }
  return "";
}

export function validateItem({ name, description }) {
  const errors = {};
  const nameError = validateName(name);
  const descriptionError = validateDescription(description);
  if (nameError) {
    errors.name = nameError;
  }
  if (descriptionError) {
    errors.description = descriptionError;
  }
  return errors;
}
