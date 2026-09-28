"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Categories",
    href: "/categories",
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-[72vw] max-w-[280px] border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl transition-transform duration-300 ease-out md:w-[clamp(220px,22vw,300px)] md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full min-h-screen flex-col">
        <div className="flex h-20 items-center justify-between border-b border-zinc-800/80 px-6">
          <Link
            href="/"
            onClick={onClose}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-base font-bold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-emerald-900/40">
              I
            </div>

            <div>
              <p className="text-[15px] font-semibold tracking-tight text-white">
                Inventory
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">Management</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-zinc-800 hover:text-white md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Workspace
          </p>

          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-white shadow-sm shadow-emerald-950/20"
                      : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <span
                    className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                        : "bg-zinc-700 group-hover:bg-zinc-500"
                    }`}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-zinc-800/80 p-5">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950/80 p-4">
            <p className="text-sm font-medium text-zinc-200">
              Inventory system
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Keep your products, categories, and stock organized in one place.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
