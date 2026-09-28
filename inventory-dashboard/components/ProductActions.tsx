"use client";

import Link from "next/link";
import {
  Ellipsis,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import DeleteDialog from "@/components/DeleteDialog";

type ProductActionsProps = {
  productId: string;
  productName: string;
};

export default function ProductActions({
  productId,
  productName,
}: ProductActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  function handleDeleteClick() {
    setIsOpen(false);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteConfirm() {
    console.log("Delete product:", productId);

    setIsDeleteDialogOpen(false);
  }

  return (
    <>
      <div className="relative">
        {/*? trigger */}

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Open product actions"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <Ellipsis size={18} />
        </button>

        {/*? menu */}

        {isOpen && (
          <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/40">
            <Link
              href={`/products/${productId}`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <Eye size={16} />
              View details
            </Link>

            <Link
              href={`/products/${productId}/edit`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <Pencil size={16} />
              Edit product
            </Link>

            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
            >
              <Trash2 size={16} />
              Delete product
            </button>
          </div>
        )}
      </div>

      {/*? delete dialog */}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        productName={productName}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}