"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FolderKanban, Package } from "lucide-react";
import CategoryActions from "@/components/CategoryActions";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
};

export default function CategoryDetails({ categoryId }: { categoryId: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/api/categories/${categoryId}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load this category.");
        setCategory(result.category);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this category.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [categoryId]);

  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">Category Details</p>
          <p className="mt-0.5 text-xs text-zinc-600">View category information</p>
        </div>
      </header>
      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-4xl">
          <Link href="/categories" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-emerald-400">
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" /> Back to categories
          </Link>
          {loading && <p role="status" className="mt-8 text-sm text-zinc-400">Loading category...</p>}
          {error && <p role="alert" className="mt-8 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200">{error}</p>}
          {category && !loading && (
            <>
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent text-emerald-400 shadow-lg shadow-emerald-950/10"><FolderKanban size={24} /></div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">Category</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{category.name}</h1>
                    <p className="mt-2 text-sm text-zinc-500">Category ID: {category.id}</p>
                  </div>
                </div>
                <CategoryActions categoryId={String(category.id)} categoryName={category.name} />
              </div>
              <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="border-b border-zinc-800/80 p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-white">Category Information</h2>
                  <p className="mt-1 text-sm text-zinc-500">Details about this inventory category.</p>
                </div>
                <div className="grid sm:grid-cols-2">
                  <div className="border-b border-zinc-800/80 p-6 sm:border-r sm:p-8">
                    <div className="flex items-center gap-3"><Package size={18} className="text-emerald-400" /><p className="text-sm font-medium text-zinc-400">Products</p></div>
                    <p className="mt-4 text-3xl font-semibold text-white">{category.productCount}</p>
                    <p className="mt-1 text-sm text-zinc-600">products in this category</p>
                  </div>
                  <div className="border-b border-zinc-800/80 p-6 sm:p-8">
                    <p className="text-sm font-medium text-zinc-400">Created</p>
                    <p className="mt-4 text-lg font-semibold text-white">{new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(category.createdAt))}</p>
                    <p className="mt-1 text-sm text-zinc-600">Category creation date</p>
                  </div>
                  <div className="p-6 sm:col-span-2 sm:p-8">
                    <p className="text-sm font-medium text-zinc-400">Description</p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-zinc-500">{category.description || "No description provided."}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
