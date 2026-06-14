import { cn, getStatusColor, getStatusLabel } from "../../utils/helpers";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "label-tag inline-flex items-center gap-1",
        getStatusColor(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {getStatusLabel(status)}
    </span>
  );
}
