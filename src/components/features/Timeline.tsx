import { motion } from "framer-motion";
import { Layers, MessageSquare, CircleDot, Package } from "lucide-react";
import type { TimelineEvent } from "../../types";
import { formatRelativeTime } from "../../utils/helpers";
import { cn } from "../../utils/helpers";

const iconMap = {
  version: Layers,
  annotation: MessageSquare,
  status: CircleDot,
  delivery: Package,
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-paper-300" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = iconMap[event.type] || CircleDot;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="relative flex gap-4"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                  event.type === "version" && "bg-brand-orange/10 text-brand-orange",
                  event.type === "annotation" && "bg-brand-coral/10 text-brand-coral",
                  event.type === "status" && "bg-brand-mint/10 text-brand-mint",
                  event.type === "delivery" && "bg-ink-50/10 text-ink-300"
                )}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-ink-300 font-medium text-sm">
                      {event.title}
                    </h4>
                    <p className="text-ink-50 text-sm mt-1">{event.description}</p>
                  </div>
                  <span className="text-xs text-ink-50 font-mono flex-shrink-0">
                    {formatRelativeTime(event.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={event.user.avatar}
                    alt={event.user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-ink-50">
                    {event.user.name}
                    {event.user.role === "designer" ? "（设计师）" : "（客户）"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
