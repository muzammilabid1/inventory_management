import Link from "next/link";
import { ChevronDown, Plus, Search } from "lucide-react";

import ProductActions from "@/components/ProductActions";
import StatusBadge from "@/components/StatusBadge";

const products = [
  {
    id: "1",
    name: "Laptop Pro",
    sku: "LP-2026-001",
    category: "Electronics",
    price: "$1,249.00",
    stock: 24,
    status: "In Stock" as const,
  },
  {
    id: "2",
    name: "Wireless Headphones",
    sku: "WH-2026-014",
    category: "Audio",
    price: "$149.00",
    stock: 8,
    status: "Low Stock" as const,
  },
  {
    id: "3",
    name: "Mechanical Keyboard",
    sku: "MK-2026-023",
    category: "Accessories",
    price: "$89.00",
    stock: 17,
    status: "In Stock" as const,
  },
  {
    id: "4",
    name: "USB-C Hub",
    sku: "UC-2026-031",
    category: "Accessories",
    price: "$39.00",
    stock: 0,
    status: "Out of Stock" as const,
  },
  {
    id: "5",
    name: "4K Monitor",
    sku: "4K-2026-045",
    category: "Electronics",
    price: "$499.00",
    stock: 12,
    status: "In Stock" as const,
  },
];

export default function ProductsPage() {
  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">Products</p>

          <p className="mt-0.5 text-xs text-zinc-600">Inventory management</p>
        </div>
      </header>

      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
              Inventory
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Products
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              View, manage, and organize every product in your inventory from
              one place.
            </p>
          </div>

          <Link
            href="/products/new"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30"
          >
            <Plus
              size={18}
              strokeWidth={2.2}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            Add Product
          </Link>
        </div>

        <section className="mt-12 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex flex-col gap-5 border-b border-zinc-800/80 p-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                All Products
              </h3>

              <p className="mt-1.5 text-sm text-zinc-500">
                {products.length} products in your inventory.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="search"
                  placeholder="Search products..."
                  className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 pl-10 pr-4 text-sm text-zinc-100 outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 sm:w-64"
                />
              </div>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
              >
                Filter
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/30">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Product
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Price
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/70">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition-colors duration-200 hover:bg-zinc-800/20"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-400 transition-all duration-200 group-hover:border-emerald-500/20 group-hover:text-emerald-400">
                          {product.name.charAt(0)}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-zinc-100">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-400">
                      {product.category}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-zinc-200">
                      {product.price}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-zinc-200">
                      {product.stock}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={product.status} />
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end">
                        <ProductActions
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-800/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-600">
              Showing {products.length} of {products.length} products
            </p>

            <p className="text-xs text-zinc-600">
              Inventory data is currently using temporary data.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
