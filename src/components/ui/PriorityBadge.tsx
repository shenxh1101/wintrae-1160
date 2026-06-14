import { cn, getPriorityColor, getPriorityLabel } from "../../utils/helpers";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "label-tag inline-flex items-center gap-1",
        getPriorityColor(priority),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {getPriorityLabel(priority)}
    </span>
  );
}
