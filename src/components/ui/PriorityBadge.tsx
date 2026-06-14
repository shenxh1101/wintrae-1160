import { cn, getPriorityColor, getPriorityLabel } from "../../utils/helpers";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, className, size = "md" }: PriorityBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm font-mono",
        sizeClasses,
        getPriorityColor(priority).full,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {getPriorityLabel(priority)}
    </span>
  );
}
