"use client";
import Link from "next/link";
import { useState } from "react";
import { Info, Save } from "lucide-react";

type ProductFormData = {
  name: string;
  description: string;
  sku: string;
  category: string;
  price: string;
  quantity: string;
  status: string;
};

type ProductFormProps = {
  initialData?: ProductFormData;
};

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  sku: "",
  category: "",
  price: "",
  quantity: "",
  status: "In Stock",
};

export default function ProductForm({
  initialData,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData ?? defaultFormData,
  );
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      <div className="p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Basic information
          </h2>

          <p className="mt-1.5 text-sm text-zinc-500">
            Add or update the main details for your product.
          </p>
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
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Audio">Audio</option>
              <option value="Accessories">Accessories</option>
            </select>
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
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none transition-all focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
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
            ? "Product details are ready to update, but changes aren’t saved until the backend is connected."
            : "The product is ready to add, but it won’t be saved until the backend is connected."}
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30"
        >
          <Save size={17} />

          {initialData ? "Update Product" : "Save Product"}
        </button>
      </div>
    </form>
  );
}
