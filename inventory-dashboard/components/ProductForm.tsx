"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";

type ProductFormData = {
  name: string;
  description: string;
  sku: string;
  category: string;
  price: string;
  quantity: string;
  lowStockThreshold: string;
};

type ProductFormProps = {
  productId?: string;
};
type CategoryOption = { id: number; name: string };

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  sku: "",
  category: "",
  price: "",
  quantity: "",
  lowStockThreshold: "10",
};

export default function ProductForm({
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isProductLoaded, setIsProductLoaded] = useState(!isEdit);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryLoadError, setCategoryLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/api/categories", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load categories.");
        setCategories(result.categories);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategoryLoadError(error instanceof Error ? error.message : "Could not load categories.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingCategories(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();
    async function loadProduct() {
      try {
        const response = await apiFetch(`/api/products/${productId}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load this product.");
        }

        const product = result.product;
        setFormData({
          name: product.name,
          description: product.description,
          sku: product.sku,
          category: product.category,
          price: String(product.price),
          quantity: String(product.stock),
          lowStockThreshold: String(product.lowStockThreshold),
        });
        setIsProductLoaded(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load this product.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [productId]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!isProductLoaded) {
      return;
    }
    if (isLoadingCategories || categoryLoadError || categories.length === 0) {
      setErrorMessage(
        categoryLoadError ||
          (categories.length === 0
            ? "Add a category before creating a product."
            : "Categories are still loading. Please try again."),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch(
        `/api/products${productId ? `/${productId}` : ""}`,
        {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          lowStockThreshold: Number(formData.lowStockThreshold),
        }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save the product.");
      }

      router.push("/products");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not reach the API. Make sure it is running and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isEdit && isLoadingCategories) {
    return (
      <p role="status" className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 text-sm text-zinc-300">
        Loading categories...
      </p>
    );
  }

  if (!isEdit && categoryLoadError) {
    return (
      <section role="alert" className="rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Could not load categories</h2>
        <p className="mt-2 text-sm text-zinc-400">{categoryLoadError}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/categories" className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950">Open categories</Link>
          <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 px-5 text-sm font-medium text-zinc-300">Back to products</Link>
        </div>
      </section>
    );
  }

  if (!isEdit && categories.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Add a category first</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Create a category before adding products. You can organize your products with categories that fit your inventory.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/categories/new" className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950">Add your first category</Link>
          <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 px-5 text-sm font-medium text-zinc-300">Back to products</Link>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Basic information
          </h2>

          <p className="mt-1.5 text-sm text-zinc-500">
            Add or update the main details for your product.
          </p>
          {isLoading && (
            <p className="mt-3 text-sm text-zinc-400">Loading product details...</p>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Product name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Laptop Pro"
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="md:col-span-2">
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
              rows={5}
              placeholder="Describe the product..."
              className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label
              htmlFor="sku"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              SKU
            </label>

            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleChange}
              required
              placeholder="e.g. LP-2026-001"
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={isLoadingCategories || Boolean(categoryLoadError) || categories.length === 0}
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            {isLoadingCategories && <p role="status" className="mt-2 text-xs text-zinc-500">Loading categories...</p>}
            {categoryLoadError && <p role="alert" className="mt-2 text-xs text-rose-300">{categoryLoadError}</p>}
          </div>
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Price
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Quantity
            </label>

            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder="0"
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label
              htmlFor="lowStockThreshold"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Low-stock alert at
            </label>

            <input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              required
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>
      </div>
      {errorMessage && (
        <p
          role="status"
          aria-live="polite"
          className="mx-6 mb-5 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-200 sm:mx-8"
        >
          <Info size={17} className="mt-1 shrink-0 text-amber-400" />
          {errorMessage}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 border-t border-zinc-800/80 bg-zinc-950/30 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700/80 px-5 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || isLoading || !isProductLoaded || isLoadingCategories || Boolean(categoryLoadError) || categories.length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30 disabled:cursor-wait disabled:opacity-70"
        >
          <Save size={17} />

          {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
        </button>
      </div>
    </form>
  );
}
