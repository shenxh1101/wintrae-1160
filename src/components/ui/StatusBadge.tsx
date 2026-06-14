import { cn, getStatusColor, getStatusLabel } from "../../utils/helpers";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm font-mono",
        sizeClasses,
        getStatusColor(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {getStatusLabel(status)}
    </span>
  );
}
