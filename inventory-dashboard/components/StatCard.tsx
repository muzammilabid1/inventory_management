import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Boxes, Package, XCircle } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  accent: "emerald" | "teal" | "amber" | "rose";
  icon: LucideIcon;
};

const accentStyles = {
  emerald: {
    glow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    icon: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    value: "text-emerald-400",
  },

  teal: {
    glow: "from-teal-500/15 via-teal-500/5 to-transparent",
    icon: "bg-teal-500/10 text-teal-400 ring-teal-500/20",
    value: "text-teal-400",
  },

  amber: {
    glow: "from-amber-500/15 via-amber-500/5 to-transparent",
    icon: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    value: "text-amber-400",
  },

  rose: {
    glow: "from-rose-500/15 via-rose-500/5 to-transparent",
    icon: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
    value: "text-rose-400",
  },
};

export const statIcons = {
  products: Package,
  stock: Boxes,
  lowStock: AlertTriangle,
  outOfStock: XCircle,
};

export default function StatCard({
  title,
  value,
  description,
  accent,
  icon: Icon,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-black/20">
      {/*? accent glow */}

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/*? card content */}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-400">{title}</p>

            <p
              className={`mt-4 text-3xl font-semibold tracking-tight ${styles.value}`}
            >
              {value}
            </p>
          </div>

          {/*? icon */}

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 ${styles.icon}`}
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </article>
  );
}
    