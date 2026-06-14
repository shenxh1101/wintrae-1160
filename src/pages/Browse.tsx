import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, ZoomIn, MessageSquare } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { cn, formatDateTime } from "../utils/helpers";
import { useNavigate } from "react-router-dom";

export function Browse() {
  const navigate = useNavigate();
  const {
    designGroups,
    activeGroupId,
    activeDesignId,
    setActiveGroup,
    setActiveDesign,
    openLightbox,
  } = useProjectStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(designGroups.map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const activeGroup = designGroups.find((g) => g.id === activeGroupId);
  const activeDesign = activeGroup?.designs.find((d) => d.id === activeDesignId);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-72 border-r border-paper-200 bg-white/50 overflow-y-auto">
        <div className="p-4 border-b border-paper-200">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
            方案分组
          </h2>
          <p className="text-sm text-ink-300">
            共 {designGroups.length} 组 ·{" "}
            {designGroups.reduce((sum, g) => sum + g.designs.length, 0)} 个方案
          </p>
        </div>

        <div className="p-2">
          {designGroups.map((group, groupIndex) => (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors rounded-sm",
                  "hover:bg-paper-100",
                  activeGroupId === group.id && "bg-paper-100"
                )}
              >
                {expandedGroups.has(group.id) ? (
                  <ChevronDown size={14} className="text-ink-50" />
                ) : (
                  <ChevronRight size={14} className="text-ink-50" />
                )}
                <span
                  className="font-mono text-xs uppercase tracking-wider text-ink-50"
                  style={{ "--stagger": groupIndex } as React.CSSProperties}
                >
                  {group.name}
                </span>
                <span className="ml-auto text-xs text-ink-50 font-mono">
                  {group.designs.length}
                </span>
              </button>

              {expandedGroups.has(group.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 border-l border-paper-200"
                >
                  {group.designs.map((design, designIndex) => (
                    <button
                      key={design.id}
                      onClick={() => {
                        setActiveGroup(group.id);
                        setActiveDesign(design.id);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 pr-4 text-sm transition-colors relative",
                        "hover:bg-paper-50",
                        activeDesignId === design.id && "bg-paper-50"
                      )}
                      style={{
                        "--stagger": groupIndex * 10 + designIndex,
                      } as React.CSSProperties}
                    >
                      {activeDesignId === design.id && (
                        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-orange" />
                      )}
                      <p className="text-ink-300 truncate pr-4">{design.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-ink-50 font-mono">
                          v{design.version}
                        </span>
                        {design.annotations.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-ink-50">
                            <MessageSquare size={10} />
                            {design.annotations.length}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {activeGroup ? (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
                    {activeGroup.name}
                  </p>
                  <h1 className="text-3xl font-display text-ink-300">
                    {activeGroup.description}
                  </h1>
                </div>
                <button
                  onClick={() => navigate("/comments")}
                  className="btn btn-primary"
                >
                  添加批注
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              {activeGroup.designs.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="card group cursor-pointer overflow-hidden"
                  onClick={() => {
                    setActiveDesign(design.id);
                    openLightbox(design.imageUrl, design.title);
                  }}
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/0 group-hover:bg-brand-charcoal/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={20} className="text-ink-300" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={design.status} />
                    </div>
                    {design.annotations.length > 0 && (
                      <div className="absolute top-3 left-3 bg-brand-coral text-white text-xs px-2 py-1 font-mono flex items-center gap-1">
                        <MessageSquare size={10} />
                        {design.annotations.length}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-ink-300">{design.title}</h3>
                      <span className="text-xs text-ink-50 font-mono">
                        v{design.version}
                      </span>
                    </div>
                    <p className="text-sm text-ink-50 line-clamp-2">
                      {design.description}
                    </p>
                    <p className="text-xs text-ink-50 font-mono mt-3">
                      {formatDateTime(design.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-ink-50">
            请选择一个方案分组
          </div>
        )}
      </main>

      {activeDesign && (
        <aside className="w-80 border-l border-paper-200 bg-white/50 overflow-y-auto">
          <div className="p-4 border-b border-paper-200">
            <h2 className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
              方案详情
            </h2>
            <p className="text-lg font-medium text-ink-300">
              {activeDesign.title}
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-ink-50 mb-1">状态</p>
              <StatusBadge status={activeDesign.status} />
            </div>
            <div>
              <p className="text-xs text-ink-50 mb-1">版本</p>
              <p className="text-ink-300 font-mono">v{activeDesign.version}</p>
            </div>
            <div>
              <p className="text-xs text-ink-50 mb-1">描述</p>
              <p className="text-ink-300 text-sm">{activeDesign.description}</p>
            </div>
            <div>
              <p className="text-xs text-ink-50 mb-1">批注数量</p>
              <p className="text-ink-300">{activeDesign.annotations.length} 条</p>
            </div>
            <div>
              <p className="text-xs text-ink-50 mb-1">创建时间</p>
              <p className="text-ink-300 font-mono text-sm">
                {formatDateTime(activeDesign.createdAt)}
              </p>
            </div>
            <div className="pt-4 space-y-2">
              <button
                onClick={() =>
                  openLightbox(activeDesign.imageUrl, activeDesign.title)
                }
                className="w-full btn flex items-center justify-center gap-2"
              >
                <ZoomIn size={14} /> 查看大图
              </button>
              <button
                onClick={() => navigate("/comments")}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> 添加批注
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
