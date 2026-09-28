type Status = "In Stock" | "Low Stock" | "Out of Stock";

type StatusBadgeProps = {
  status: Status;
};

const statusStyles: Record<Status, string> = {
  "In Stock":
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

  "Low Stock":
    "border-amber-500/20 bg-amber-500/10 text-amber-400",

  "Out of Stock":
    "border-rose-500/20 bg-rose-500/10 text-rose-400",
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}