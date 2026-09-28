"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import DeleteDialog from "@/components/DeleteDialog";

type CategoryActionsProps = {
  categoryId: string;
  categoryName: string;
};

export default function CategoryActions({
  categoryId,
  categoryName,
}: CategoryActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  function handleDeleteConfirm() {
    console.log("Delete category:", categoryId);

    setIsDeleteDialogOpen(false);
  }

  return (
    <>
      <div className="flex gap-3">
        <Link
          href={`/categories/${categoryId}/edit`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 px-4 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          <Pencil size={16} />
          Edit
        </Link>

        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-500/20 px-4 text-sm font-medium text-rose-400 transition-all duration-200 hover:bg-rose-500/10"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        productName={categoryName}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}