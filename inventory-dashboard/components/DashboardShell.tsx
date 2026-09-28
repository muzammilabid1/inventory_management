"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "@/components/Sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen text-zinc-100">
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/90 text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40 hover:bg-zinc-900 hover:text-white md:hidden"
      >
        <Menu size={20} />
      </button>
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <section className="min-w-0 md:ml-[clamp(220px,22vw,300px)]">
        {children}
      </section>
    </div>
  );
}
