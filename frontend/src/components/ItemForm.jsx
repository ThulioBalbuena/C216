import { useState } from "react";
import { validateItem } from "../validate.js";

const EMPTY_VALUES = { name: "", price: "", description: "" };

const baseFieldClasses =
  "mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700";

function fieldClasses(hasError) {
  return `${baseFieldClasses} ${hasError ? "border-red-600" : "border-stone-300"}`;
}

export default function ItemForm({ onAdd, loading = false }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(field) {
    return (event) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError("");
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || submitting) return;
    setSubmitError("");
    const validationErrors = validateItem(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        name: values.name.trim(),
        price: Number(values.price),
        description: values.description.trim(),
      });
      setValues(EMPTY_VALUES);
      setErrors({});
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="item-form-title"
      className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6"
    >
      <h2 id="item-form-title" className="text-lg font-semibold">
        Novo item
      </h2>
      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium">
            Nome
          </label>
          <input
            id="item-name"
            type="text"
            value={values.name}
            onChange={handleChange("name")}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "item-name-error" : undefined}
            className={fieldClasses(errors.name)}
          />
          {errors.name && (
            <p
              id="item-name-error"
              role="alert"
              className="mt-1 text-sm text-red-700"
            >
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="item-price" className="block text-sm font-medium">
            Preço
          </label>
          <input
            id="item-price"
            type="number"
            min="0"
            step="any"
            value={values.price}
            onChange={handleChange("price")}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? "item-price-error" : undefined}
            className={fieldClasses(errors.price)}
          />
          {errors.price && (
            <p id="item-price-error" role="alert">
              {errors.price}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="item-description"
            className="block text-sm font-medium"
          >
            Descrição{" "}
            <span className="font-normal text-stone-500">(opcional)</span>
          </label>
          <textarea
            id="item-description"
            rows={4}
            value={values.description}
            onChange={handleChange("description")}
            aria-invalid={errors.description ? "true" : "false"}
            aria-describedby={
              errors.description ? "item-description-error" : undefined
            }
            className={fieldClasses(errors.description)}
          />
          {errors.description && (
            <p
              id="item-description-error"
              role="alert"
              className="mt-1 text-sm text-red-700"
            >
              {errors.description}
            </p>
          )}
        </div>
        {submitError && (
          <p role="alert" className="text-sm text-red-700">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || submitting}
          className="w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
        >
          {submitting ? "Salvando…" : "Adicionar item"}
        </button>
      </form>
    </section>
  );
}
