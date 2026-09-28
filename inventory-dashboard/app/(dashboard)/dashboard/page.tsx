import Link from "next/link";
import StatCard, { statIcons } from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

/*? temporary dashboard statistics */

const inventoryStats = [
  {
    title: "Total Products",
    value: "248",
    description: "Products currently in your inventory",
    accent: "emerald" as const,
    icon: statIcons.products,
  },
  {
    title: "Total Stock",
    value: "1,842",
    description: "Units currently available",
    accent: "teal" as const,
    icon: statIcons.stock,
  },
  {
    title: "Low Stock",
    value: "18",
    description: "Products that need attention",
    accent: "amber" as const,
    icon: statIcons.lowStock,
  },
  {
    title: "Out of Stock",
    value: "7",
    description: "Products currently unavailable",
    accent: "rose" as const,
    icon: statIcons.outOfStock,
  },
];

const recentProducts = [
  {
    name: "Laptop Pro",
    sku: "LP-2026-001",
    category: "Electronics",
    stock: 24,
    status: "In Stock" as const,
  },
  {
    name: "Wireless Headphones",
    sku: "WH-2026-014",
    category: "Audio",
    stock: 8,
    status: "Low Stock" as const,
  },
  {
    name: "Mechanical Keyboard",
    sku: "MK-2026-023",
    category: "Accessories",
    stock: 17,
    status: "In Stock" as const,
  },
  {
    name: "USB-C Hub",
    sku: "UC-2026-031",
    category: "Accessories",
    stock: 0,
    status: "Out of Stock" as const,
  },
];

export default function Home() {
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

            {/*? product list */}

            <div className="divide-y divide-zinc-800/70">
              {recentProducts.map((product) => (
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
