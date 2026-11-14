import { useEffect, useState } from "react";
import ItemForm from "./components/ItemForm.jsx";
import ItemList from "./components/ItemList.jsx";
import { createItem, listItems } from "./services/items.js";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    listItems()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleAddItem(values) {
    const item = await createItem(values);
    setItems((current) => [...current, item]);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Gerenciador de itens
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Cadastre itens com nome, preço e descrição.
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <ItemForm onAdd={handleAddItem} loading={loading} />
        {loading ? (
          <p role="status">Carregando itens…</p>
        ) : (
          <div>
            {loadError && <p role="alert">{loadError}</p>}
            {(!loadError || items.length > 0) && <ItemList items={items} />}
          </div>
        )}
      </main>
    </div>
  );
}
