"use client";

import { Trash2, X } from "lucide-react";

type DeleteDialogProps = {
  isOpen: boolean;
  itemName: string;
  itemType: "product" | "category";
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isBusy?: boolean;
  errorMessage?: string;
};

export default function DeleteDialog({
  isOpen,
  itemName,
  itemType,
  onClose,
  onConfirm,
  isBusy = false,
  errorMessage = "",
}: DeleteDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/*? backdrop */}

      <button
        type="button"
        aria-label="Close delete dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/*? dialog */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950 shadow-2xl shadow-black/50"
      >
        {/*? close button */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <X size={18} />
        </button>

        {/*? dialog content */}

        <div className="p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <Trash2 size={20} />
          </div>

          <h2
            id="delete-dialog-title"
            className="mt-5 text-xl font-semibold tracking-tight text-white"
          >
            Delete {itemType}?
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            You're about to permanently delete{" "}
            <span className="font-medium text-zinc-200">
              {itemName}
            </span>
            . This action cannot be undone.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="mx-6 mb-5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300 sm:mx-7">
            {errorMessage}
          </p>
        )}

        {/*? actions */}

        <div className="flex flex-col-reverse gap-3 border-t border-zinc-800/80 bg-zinc-900/30 px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-700/80 px-4 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-950/30 disabled:cursor-wait disabled:opacity-70"
          >
            <Trash2 size={16} />
            {isBusy ? "Deleting..." : `Delete ${itemType}`}
          </button>
        </div>
      </div>
    </div>
  );
}
