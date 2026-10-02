"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type CategoryFormData = {
  name: string;
  description: string;
};

type CategoryFormProps = {
  categoryId?: string;
};

const emptyForm: CategoryFormData = { name: "", description: "" };

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = Boolean(categoryId);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);
  const [hasLoaded, setHasLoaded] = useState(!isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    const controller = new AbortController();
    apiFetch(`/api/categories/${categoryId}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load this category.");
        setFormData({ name: result.category.name, description: result.category.description });
        setHasLoaded(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load this category.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [categoryId]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setErrorMessage("");
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (!hasLoaded) return;
    setIsSubmitting(true);

    try {
      const response = await apiFetch(`/api/categories${categoryId ? `/${categoryId}` : ""}`, {
        method: categoryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the category.");
      router.push(categoryId ? `/categories/${categoryId}` : "/categories");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save the category.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
      {isLoading && <p role="status" className="px-6 pt-6 text-sm text-zinc-400 sm:px-8">Loading category...</p>}
      {errorMessage && <p role="alert" className="mx-6 mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-200 sm:mx-8">{errorMessage}</p>}
      <div className="border-b border-zinc-800/80 p-6 sm:p-8">
        <div className="grid gap-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">Category Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="e.g. Electronics" className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10" required disabled={!hasLoaded} />
          </div>
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe what products belong to this category..." rows={5} className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm leading-6 text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10" required disabled={!hasLoaded} />
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 bg-zinc-950/30 p-6 sm:flex-row sm:items-center sm:justify-end sm:p-8">
        <button type="button" onClick={() => window.history.back()} className="h-11 rounded-xl border border-zinc-800 px-5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white">Cancel</button>
        <button type="submit" disabled={isSubmitting || isLoading || !hasLoaded} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30 disabled:cursor-wait disabled:opacity-60">
          <Save size={17} />
          {isSubmitting ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
        </button>
      </div>
    </form>
  );
}
