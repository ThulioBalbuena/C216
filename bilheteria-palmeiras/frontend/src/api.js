const storageKey = "bilheteria-palmeiras.browser";

function browserId() {
  const saved = localStorage.getItem(storageKey);
  if (saved) return saved;
  const id = crypto.randomUUID();
  localStorage.setItem(storageKey, id);
  return id;
}

export async function api(path, { signal, method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      signal,
      method,
      headers: {
        ...(path.startsWith("/simulations")
          ? { "X-Browser-ID": browserId() }
          : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Falha de conexão. Tente novamente.");
  }
  if (response.status === 204) return;
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "Não foi possível concluir a operação.",
    );
  }
  return response.json();
}
