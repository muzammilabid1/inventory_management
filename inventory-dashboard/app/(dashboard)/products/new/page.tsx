import Link from "next/link";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            Products
          </p>

          <p className="mt-0.5 text-xs text-zinc-600">
            Create product
          </p>
        </div>
      </header>

      <div className="px-6 py-10 lg:px-10 lg:py-12">

        <Link
          href="/products"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-emerald-400"
        >
          ← Back to products
        </Link>

        <div className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Inventory
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Add Product
          </h1>

          <p className="mt-5 text-base leading-7 text-zinc-400">
            Add a new product to your inventory with its pricing,
            stock, and category information.
          </p>
        </div>

        <div className="mt-10 max-w-4xl">
          <ProductForm />
        </div>
      </div>
    </>
  );
}