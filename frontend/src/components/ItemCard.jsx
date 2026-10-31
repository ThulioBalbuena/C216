export default function ItemCard({ name, description }) {
  return (
    <article className="rounded-md border border-stone-200 p-4">
      <h3 className="break-words font-medium">{name}</h3>
      {description && (
        <p className="mt-1 whitespace-pre-line break-words text-sm text-stone-600">
          {description}
        </p>
      )}
    </article>
  );
}
