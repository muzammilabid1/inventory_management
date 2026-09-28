"use client";

import { Info, Save } from "lucide-react";
import { useState } from "react";

type CategoryFormData = {
  name: string;
  description: string;
};

type CategoryFormProps = {
  initialData?: CategoryFormData;
};

const defaultFormData: CategoryFormData = {
  name: "",
  description: "",
};

export default function CategoryForm({
  initialData,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData ?? defaultFormData,
  );
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setShowDemoNotice(false);
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowDemoNotice(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm"
    >   
      <div className="border-b border-zinc-800/80 p-6 sm:p-8">
        <div className="grid gap-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Category Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Electronics"
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what products belong to this category..."
              rows={5}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm leading-6 text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              required
            />
          </div>
        </div>
      </div>
      {showDemoNotice && (
        <p
          role="status"
          aria-live="polite"
          className="mx-6 mb-5 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-200 sm:mx-8"
        >
          <Info size={17} className="mt-1 shrink-0 text-amber-400" />
          {initialData
            ? "Category details are ready to update, but changes aren’t saved until the backend is connected."
            : "The category is ready to add, but it won’t be saved until the backend is connected."}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 bg-zinc-950/30 p-6 sm:flex-row sm:items-center sm:justify-end sm:p-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="h-11 rounded-xl border border-zinc-800 px-5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30"
        >
          <Save size={17} />

          {initialData ? "Update Category" : "Save Category"}
        </button>
      </div>
    </form>
  );
}
