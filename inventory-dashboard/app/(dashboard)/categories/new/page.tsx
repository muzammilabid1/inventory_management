import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CategoryForm from "@/components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            Categories
          </p>

          <p className="mt-0.5 text-xs text-zinc-600">
            Add a new category
          </p>
        </div>
      </header>
      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/categories"
            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-emerald-400"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />

            Back to categories
          </Link>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
              Organization
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Add Category
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Create a category to keep your products organized
              and easy to manage.
            </p>
          </div>

          <div className="mt-10">
            <CategoryForm />
          </div>
        </div>
      </div>
    </>
  );
}