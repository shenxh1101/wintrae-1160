import { motion } from "framer-motion";
import {
  Calendar,
  Layers,
  MessageSquare,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { Timeline } from "../components/features/Timeline";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatDate, formatRelativeTime } from "../utils/helpers";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();
  const { project, timelineEvents, versions, getAllAnnotations } =
    useProjectStore();
  const allAnnotations = getAllAnnotations();
  const openAnnotations = allAnnotations.filter((a) => a.status === "open");
  const resolvedAnnotations = allAnnotations.filter(
    (a) => a.status === "resolved"
  );
  const approvedDesigns = useProjectStore((state) =>
    state.designGroups.flatMap((g) => g.designs).filter((d) => d.status === "approved")
  );
  const totalDesigns = useProjectStore((state) =>
    state.designGroups.flatMap((g) => g.designs)
  );

  const stats = [
    {
      label: "待处理批注",
      value: openAnnotations.length,
      icon: MessageSquare,
      color: "text-brand-coral",
      bgColor: "bg-brand-coral/10",
    },
    {
      label: "已解决",
      value: resolvedAnnotations.length,
      icon: CheckCircle2,
      color: "text-brand-mint",
      bgColor: "bg-brand-mint/10",
    },
    {
      label: "方案进度",
      value: `${approvedDesigns.length}/${totalDesigns.length}`,
      icon: Layers,
      color: "text-brand-orange",
      bgColor: "bg-brand-orange/10",
    },
  ];

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-[420px] overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/80 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <StatusBadge status={project.status} className="mb-4" />
            <h1 className="text-5xl font-display text-white font-bold mb-3">
              {project.title}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mb-6">
              {project.description}
            </p>
            <div className="flex items-center gap-8 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="font-mono">
                  {formatDate(project.startDate)} -{" "}
                  {formatDate(project.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="font-mono">
                  预计 {Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天后截止
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-ink-300">项目概览</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-50">整体进度</span>
              <span className="text-2xl font-display font-bold text-brand-orange">
                {project.progress}%
              </span>
            </div>
          </div>
          <div className="h-1 bg-paper-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-orange to-brand-coral rounded-full"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-ink-50 text-sm mb-2">{stat.label}</p>
                  <p className="text-4xl font-display font-bold text-ink-300">
                    {stat.value}
                  </p>
                </div>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", stat.bgColor)}>
                  <stat.icon size={22} className={stat.color} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="col-span-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-ink-300">项目动态</h2>
              <button
                onClick={() => navigate("/comments")}
                className="text-sm text-brand-orange hover:underline flex items-center gap-1"
              >
                查看全部批注 <ChevronRight size={14} />
              </button>
            </div>
            <div className="card p-6">
              <Timeline events={timelineEvents.slice(0, 5)} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="col-span-4"
          >
            <h2 className="text-2xl font-display text-ink-300 mb-6">版本记录</h2>
            <div className="space-y-4">
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  className="card p-4 cursor-pointer hover:border-l-2 hover:border-l-brand-orange transition-all"
                  onClick={() => navigate("/compare")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-brand-orange font-medium">
                      v{version.number}
                    </span>
                    <span className="text-xs text-ink-50 font-mono">
                      {formatRelativeTime(version.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-ink-300 font-medium mb-1">
                    {version.name}
                  </h4>
                  <p className="text-ink-50 text-sm line-clamp-2">
                    {version.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-ink-50">
                      {version.changes.length} 处改动
                    </span>
                    <span className="text-ink-100">·</span>
                    <span className="text-xs text-ink-50">
                      {version.designIds.length} 个方案
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
