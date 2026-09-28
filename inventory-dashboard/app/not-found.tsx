import Link from "next/link";
import { ArrowLeft, House, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-950/20">
          <SearchX size={28} strokeWidth={1.7} />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
          We couldn’t find the page you’re looking for. It may have moved, or
          the address might be incorrect.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
          >
            <House size={16} />
            Go to dashboard
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/70 px-5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft size={16} />
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
