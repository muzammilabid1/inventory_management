"use client";

import { useEffect, useReducer } from "react";
import Link from "next/link";
import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Category = { id: number; name: string; description: string; productCount: number };
type State = { categories: Category[]; loading: boolean; error: string };
type Action = { type: "loaded"; categories: Category[] } | { type: "failed" };
const initialState: State = { categories: [], loading: true, error: "" };
function reducer(state: State, action: Action): State {
  return action.type === "loaded"
    ? { categories: action.categories, loading: false, error: "" }
    : { ...state, loading: false, error: "Could not load categories. Check that the API is running and try again." };
}

export default function CategoriesPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    apiFetch("/api/categories")
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data: { categories: Category[] }) => dispatch({ type: "loaded", categories: data.categories }))
      .catch(() => dispatch({ type: "failed" }));
  }, []);
  const { categories, loading, error } = state;
  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">Categories</p>

          <p className="mt-0.5 text-xs text-zinc-600">
            Organize your inventory
          </p>
        </div>
      </header>
      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
              Organization
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Categories
            </h1>

            <p className="mt-5 text-base leading-7 text-zinc-400">
              Organize your products into clear categories and keep your
              inventory easy to manage.
            </p>
          </div>
          <Link
            href="/categories/new"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30"
          >
            <Plus size={17} />
            Add Category
          </Link>
        </div>
        {error && <p className="mt-8 text-sm text-rose-400">{error}</p>}
        {loading && <p className="mt-8 text-sm text-zinc-500">Loading categories…</p>}
        {!loading && !error && categories.length === 0 && <p className="mt-8 text-sm text-zinc-500">No categories yet. Add a category to organize your products.</p>}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-emerald-950/10"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl transition-all duration-500 group-hover:bg-emerald-400/10" />
              <div className="relative flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent text-emerald-400 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:shadow-lg group-hover:shadow-emerald-950/20">
                  <FolderKanban size={21} />
                </div>

                <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs font-medium text-zinc-500">
                  {category.productCount} products
                </span>
              </div>
              <div className="relative mt-6">
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  {category.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {category.description}
                </p>
              </div>
              <Link
                href={`/categories/${category.id}`}
                className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-all duration-200 group-hover:text-emerald-400"
              >
                View category
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
