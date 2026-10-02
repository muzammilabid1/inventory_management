import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryForm from "@/components/CategoryForm";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">Edit Category</p>
          <p className="mt-0.5 text-xs text-zinc-600">Update category information</p>
        </div>
      </header>
      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <Link href={`/categories/${id}`} className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-emerald-400">
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" /> Back to category
          </Link>
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">Organization</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Edit Category</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">Update the information for this inventory category.</p>
          </div>
          <div className="mt-10"><CategoryForm categoryId={id} /></div>
        </div>
      </div>
    </>
  );
}
