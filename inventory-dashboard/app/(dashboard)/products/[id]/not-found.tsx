import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-16 lg:px-10">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-950/20">
          <PackageX size={28} strokeWidth={1.7} />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Product unavailable
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Product not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
          This product may have been removed, or the link may be out of date.
          Head back to the inventory to find what you need.
        </p>

        <Link
          href="/products"
          className="mt-9 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to products
        </Link>
      </div>
    </main>
  );
}
