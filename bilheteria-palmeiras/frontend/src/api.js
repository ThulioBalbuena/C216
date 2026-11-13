export async function api(path, { signal } = {}) {
  const response = await fetch(`/api${path}`, { signal });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "Não foi possível carregar os dados.",
    );
  }
  return response.json();
}
