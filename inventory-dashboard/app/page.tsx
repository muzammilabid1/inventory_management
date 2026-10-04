import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ChartNoAxesCombined,
  Check,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  TrendingDown,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Know what you have",
    description:
      "Keep product details, SKUs, and quantities together in one clear inventory view.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Spot stock changes",
    description:
      "See low and out-of-stock items quickly, so the next action is easy to find.",
  },
  {
    icon: Tags,
    title: "Stay organized",
    description:
      "Group products into categories that make sense for the way your business works.",
  },
];

const previewProducts = [
  { name: "Laptop Pro", sku: "LP-2026-001", quantity: "24", status: "In stock", color: "emerald" },
  { name: "Wireless Headphones", sku: "WH-2026-014", quantity: "8", status: "Low stock", color: "amber" },
  { name: "USB-C Hub", sku: "UC-2026-031", quantity: "0", status: "Out of stock", color: "rose" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="relative z-10 border-b border-zinc-800/70">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10" aria-label="Main navigation">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-emerald-900/40">
              <Boxes size={21} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-white">Inventory</span>
              <span className="mt-0.5 block text-[11px] text-zinc-500">Inventory management</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/register" className="group inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-400/15 hover:text-emerald-200">
              Get started
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate">
        <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[560px] w-[560px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="pointer-events-none absolute -left-40 top-48 -z-10 h-[420px] w-[420px] rounded-full bg-teal-500/[0.07] blur-[130px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-10 lg:pb-32 lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-2 text-xs font-medium text-emerald-300">
              <Sparkles size={14} className="transition-transform duration-300 hover:rotate-12" />
              A clearer way to manage inventory
            </div>
            <h1 className="mt-7 text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.35rem]">
              Your inventory,
              <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                under control.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              Bring products, categories, and stock levels into one calm workspace. Know what you have and what needs attention without the spreadsheet scramble.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30">
                Create your workspace
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/dashboard" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-white">
                Explore the dashboard
                <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-emerald-400" />Simple product tracking</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-emerald-400" />Stock status at a glance</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
            <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/[0.07] blur-2xl" />
            <div className="relative -rotate-1 overflow-hidden rounded-2xl border border-zinc-700/70 bg-[#0d0f10] shadow-2xl shadow-black/50 transition-transform duration-500 hover:rotate-0 sm:rounded-3xl">
              <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 px-4 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><Boxes size={16} /></span>
                  <span className="text-xs font-semibold text-zinc-200">Inventory overview</span>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500"><Search size={14} /></span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Monday, September 28</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Good morning</h2>
                    <p className="mt-1 text-xs text-zinc-500">Here’s what’s happening with your stock.</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400"><Plus size={17} /></span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { label: "Products", value: "248", icon: Package, tone: "text-emerald-400 bg-emerald-500/10" },
                    { label: "In stock", value: "1,842", icon: Boxes, tone: "text-teal-300 bg-teal-500/10" },
                    { label: "Needs attention", value: "25", icon: TrendingDown, tone: "text-amber-300 bg-amber-500/10" },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:p-4">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.tone}`}><Icon size={14} /></span>
                        <p className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">{stat.value}</p>
                        <p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-[11px]">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Stock overview</p>
                      <p className="mt-1 text-[10px] text-zinc-600">Recent product status</p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400">View inventory <ArrowRight size={11} className="ml-1 inline" /></span>
                  </div>
                  <div className="divide-y divide-zinc-800/70">
                    {previewProducts.map((product) => (
                      <div key={product.sku} className="flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-zinc-800/30">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-400 transition-colors hover:border-emerald-500/30 hover:text-emerald-300">{product.name[0]}</span>
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-medium text-zinc-200">{product.name}</p>
                            <p className="mt-0.5 text-[10px] text-zinc-600">{product.sku}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                          <span className="hidden text-[10px] text-zinc-500 sm:inline">{product.quantity} units</span>
                          <span className={`rounded-full border px-2 py-1 text-[9px] font-medium sm:text-[10px] ${product.color === "emerald" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : product.color === "amber" ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300"}`}>{product.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-zinc-700/70 bg-zinc-900/95 px-4 py-3 shadow-xl shadow-black/40 sm:flex lg:-left-10">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"><TrendingDown size={17} /></span>
              <span><span className="block text-xs font-semibold text-zinc-100">Stock stays visible</span><span className="mt-1 block text-[10px] text-zinc-500">Catch low inventory early</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800/70 bg-zinc-950/35">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-3 lg:px-10 lg:py-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/25 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-emerald-950/10 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-400/30 group-hover:bg-emerald-500/15 group-hover:text-emerald-300">
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  <span className="text-xs font-medium text-zinc-700">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-zinc-100">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.09] via-zinc-900/80 to-teal-500/[0.06] px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-emerald-300"><ShieldCheck size={15} />Built for clarity</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A better view of what keeps you moving.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">Start with an organized workspace for the products you rely on every day.</p>
            </div>
            <Link href="/register" className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-950/30">
              Get started
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link href="/" className="group inline-flex w-fit items-center gap-2.5 text-zinc-400 transition-colors hover:text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-zinc-950 transition-transform duration-300 group-hover:rotate-3"><Boxes size={15} /></span>
            <span className="font-semibold">Inventory</span>
          </Link>
          <p>© 2026 Muzammil. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition-colors hover:text-zinc-300">Sign in</Link>
            <Link href="/register" className="transition-colors hover:text-zinc-300">Create account</Link>
            <Link href="/dashboard" className="inline-flex items-center gap-1 transition-colors hover:text-zinc-300">Dashboard <ArrowUpRight size={12} /></Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
