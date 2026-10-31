import { useState } from "react";
import { validateItem } from "../validate.js";

const EMPTY_VALUES = { name: "", description: "" };

const baseFieldClasses =
  "mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700";

function fieldClasses(hasError) {
  return `${baseFieldClasses} ${hasError ? "border-red-600" : "border-stone-300"}`;
}

export default function ItemForm({ onAdd }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});

  function handleChange(field) {
    return (event) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateItem(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onAdd({ name: values.name.trim(), description: values.description.trim() });
    setValues(EMPTY_VALUES);
    setErrors({});
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
        <button
          type="submit"
          className="w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
        >
          Adicionar item
        </button>
      </form>
    </section>
  );
}
