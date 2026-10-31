import { useRef, useState } from "react";
import ItemForm from "./components/ItemForm.jsx";
import ItemList from "./components/ItemList.jsx";

export default function App() {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  function handleAddItem({ name, description }) {
    const item = { id: nextId.current, name, description };
    nextId.current += 1;
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
            Cadastre itens com nome e descrição.
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <ItemForm onAdd={handleAddItem} />
        <ItemList items={items} />
      </main>
    </div>
  );
}
