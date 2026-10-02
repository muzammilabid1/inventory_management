"use client";

import { useEffect, useReducer } from "react";
import Link from "next/link";
import StatCard, { statIcons } from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

type Product = { id: number; name: string; sku: string; category: string; stock: number; status: "In Stock" | "Low Stock" | "Out of Stock" };
type State = { products: Product[]; loading: boolean; error: string };
type Action = { type: "loaded"; products: Product[] } | { type: "failed" };
const initialState: State = { products: [], loading: true, error: "" };
function reducer(state: State, action: Action): State {
  if (action.type === "loaded") return { products: action.products, loading: false, error: "" };
  return { ...state, loading: false, error: "Could not load dashboard data. Check that the API is running and try again." };
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:4000";
    fetch(`${api}/api/products`, { credentials: "include" })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data: { products: Product[] }) => dispatch({ type: "loaded", products: data.products }))
      .catch(() => dispatch({ type: "failed" }));
  }, []);

  const { products, loading, error } = state;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryStats = [
    { title: "Total Products", value: String(products.length), description: "Products currently in your inventory", accent: "emerald" as const, icon: statIcons.products },
    { title: "Total Stock", value: totalStock.toLocaleString(), description: "Units currently available", accent: "teal" as const, icon: statIcons.stock },
    { title: "Low Stock", value: String(products.filter((product) => product.status === "Low Stock").length), description: "Products that need attention", accent: "amber" as const, icon: statIcons.lowStock },
    { title: "Out of Stock", value: String(products.filter((product) => product.status === "Out of Stock").length), description: "Products currently unavailable", accent: "rose" as const, icon: statIcons.outOfStock },
  ];
  return (
    <>
      <header className="flex h-16 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-8">
        <h1 className="text-sm font-medium text-zinc-300">Dashboard</h1>
      </header>
      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Overview
          </p>

          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Welcome to your inventory
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Manage your products, monitor stock levels, and keep your inventory
            organized from one simple dashboard.
          </p>
        </div>

        <section className="mt-10">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {inventoryStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/*? recent products */}

        <section className="mt-10">
          <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
            {/*? section header */}

            <div className="flex flex-col gap-4 border-b border-zinc-800/80 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Recent Products
                </h3>

                <p className="mt-1.5 text-sm text-zinc-500">
                  Recently added products in your inventory.
                </p>
              </div>

              <Link
                href="/products"
                className="self-start text-sm font-medium text-emerald-400 transition-colors duration-200 hover:text-emerald-300 sm:self-auto"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-zinc-800/70">
              {error ? <p className="p-6 text-sm text-rose-400">{error}</p> : loading ? <p className="p-6 text-sm text-zinc-500">Loading products…</p> : products.length === 0 ? <p className="p-6 text-sm text-zinc-500">No products yet. Add a product to see your inventory here.</p> : products.slice(0, 4).map((product) => (
                <div
                  key={product.sku}
                  className="group px-6 py-5 transition-colors duration-200 hover:bg-zinc-800/20"
                >
                  {/*? product row */}

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/*? product information */}

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-400 transition-all duration-200 group-hover:border-emerald-500/20 group-hover:text-emerald-400">
                        {product.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-zinc-100">
                          {product.name}
                        </h4>

                        <p className="mt-1 truncate text-xs text-zinc-600">
                          {product.sku}
                        </p>
                      </div>
                    </div>

                    {/*? product metadata */}

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:flex lg:items-center lg:gap-8">
                      {/*? category */}

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                          Category
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          {product.category}
                        </p>
                      </div>

                      {/*? stock */}

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                          Stock
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {product.stock}
                        </p>
                      </div>

                      {/*? status */}

                      <div className="col-span-2 sm:col-span-1">
                        <p className="mb-1.5 text-[11px] uppercase tracking-wider text-zinc-600 lg:hidden">
                          Status
                        </p>

                        <StatusBadge status={product.status} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
