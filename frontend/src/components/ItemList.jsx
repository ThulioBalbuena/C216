import ItemCard from "./ItemCard.jsx";

export default function ItemList({ items }) {
  return (
    <section
      aria-labelledby="item-list-title"
      className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6"
    >
      <h2 id="item-list-title" className="text-lg font-semibold">
        Itens cadastrados ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-stone-600">
          Nenhum item cadastrado. Preencha o formulário para adicionar o
          primeiro.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard name={item.name} description={item.description} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
