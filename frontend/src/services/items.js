const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, method = "GET", data) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      ...(data !== undefined && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    });
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "Não foi possível concluir a operação.",
    );
  }
  return response.status === 204 ? undefined : response.json();
}

export async function listItems() {
  const items = [];
  const limit = 100;
  for (let skip = 0; ; skip += limit) {
    const page = await request(`/items?skip=${skip}&limit=${limit}`);
    items.push(...page);
    if (page.length < limit) return items;
  }
}

export const getItem = (id) => request(`/items/${id}`);
export const createItem = (item) => request("/items", "POST", item);
export const replaceItem = (id, item) => request(`/items/${id}`, "PUT", item);
export const updateItem = (id, changes) =>
  request(`/items/${id}`, "PATCH", changes);
export const deleteItem = (id) => request(`/items/${id}`, "DELETE");
