import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Package,
  Pencil,
  Tag,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";

const product = {
  id: "1",
  name: "Laptop Pro",
  sku: "LP-2026-001",
  category: "Electronics",
  price: "$1,249.00",
  stock: 24,
  status: "In Stock" as const,
  description:
    "A high-performance laptop designed for professional work, development, and everyday productivity.",
  createdAt: "September 12, 2026",
};

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  console.log("Product ID:", id);

  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            Products
          </p>

          <p className="mt-0.5 text-xs text-zinc-600">
            Product details
          </p>
        </div>
      </header>

      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to products
        </Link>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent text-xl font-semibold text-emerald-300 shadow-xl shadow-emerald-950/20">
              {product.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
                Product
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-sm text-zinc-500">
                SKU: {product.sku}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/products/${id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/70 px-4 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            >
              <Pencil size={16} />
              Edit Product
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 text-sm font-medium text-rose-400 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10"
            >
              Delete Product
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">
                Current Stock
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <Package size={19} />
              </div>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {product.stock}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Units available
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">
                Price
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                <Tag size={19} />
              </div>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {product.price}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Current selling price
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">
                Status
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                <CalendarDays size={19} />
              </div>
            </div>

            <div className="mt-5">
              <StatusBadge status={product.status} />
            </div>

            <p className="mt-4 text-xs text-zinc-600">
              Product availability
            </p>
          </article>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="border-b border-zinc-800/80 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Product Information
            </h2>

            <p className="mt-1.5 text-sm text-zinc-500">
              Detailed information about this product.
            </p>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Category
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-200">
                {product.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                SKU
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-200">
                {product.sku}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Description
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
                {product.description}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Created
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-200">
                {product.createdAt}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}