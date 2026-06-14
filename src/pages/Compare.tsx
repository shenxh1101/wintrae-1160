import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Minus,
  ArrowLeftRight,
} from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import {
  cn,
  formatDate,
  getChangeTypeColor,
  getChangeTypeLabel,
} from "../utils/helpers";

export function Compare() {
  const {
    versions,
    compareVersionIds,
    setCompareVersions,
    toggleChangeConfirmed,
    getVersionById,
    designGroups,
  } = useProjectStore();

  const [leftVersionOpen, setLeftVersionOpen] = useState(false);
  const [rightVersionOpen, setRightVersionOpen] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const leftVersion = getVersionById(compareVersionIds[0]);
  const rightVersion = getVersionById(compareVersionIds[1]);

  const allDesigns = designGroups.flatMap((g) => g.designs);
  const leftDesigns = allDesigns.filter((d) =>
    leftVersion?.designIds.includes(d.id)
  );
  const rightDesigns = allDesigns.filter((d) =>
    rightVersion?.designIds.includes(d.id)
  );

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(10, Math.min(90, position)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!syncScroll) return;
      const source = e.currentTarget;
      const target =
        source === leftPanelRef.current
          ? rightPanelRef.current
          : leftPanelRef.current;
      if (target) {
        target.scrollTop = source.scrollTop;
        target.scrollLeft = source.scrollLeft;
      }
    },
    [syncScroll]
  );

  const allChanges = [
    ...(leftVersion?.changes || []),
    ...(rightVersion?.changes || []),
  ];
  const confirmedCount = allChanges.filter((c) => c.confirmed).length;

  const changeTypeIcon = (type: string) => {
    switch (type) {
      case "added":
        return Plus;
      case "modified":
        return Edit3;
      case "removed":
        return Minus;
      default:
        return Circle;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-8 py-4 border-b border-paper-200 bg-white/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
              版本对比
            </p>
            <h1 className="text-3xl font-display text-ink-300">
              对比不同版本的设计差异
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-300">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="w-4 h-4 accent-brand-orange"
              />
              同步滚动
            </label>
            <button className="btn flex items-center gap-2">
              <ArrowLeftRight size={14} />
              交换版本
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="relative">
            <button
              onClick={() => setLeftVersionOpen(!leftVersionOpen)}
              className="w-full p-3 border border-paper-200 rounded-sm text-left flex items-center justify-between hover:border-ink-100 transition-colors bg-white"
            >
              <div>
                <span className="font-mono text-sm text-brand-orange font-medium">
                  v{leftVersion?.number}
                </span>
                <span className="mx-2 text-ink-100">·</span>
                <span className="text-sm text-ink-300">{leftVersion?.name}</span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-ink-50 transition-transform",
                  leftVersionOpen && "rotate-180"
                )}
              />
            </button>
            {leftVersionOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-paper-200 rounded-sm shadow-card z-10 max-h-64 overflow-y-auto">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setCompareVersions(v.id, compareVersionIds[1]);
                      setLeftVersionOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 text-left text-sm hover:bg-paper-50 transition-colors",
                      v.id === compareVersionIds[0] && "bg-paper-100"
                    )}
                  >
                    <span className="font-mono text-brand-orange font-medium">
                      v{v.number}
                    </span>
                    <span className="mx-2 text-ink-100">·</span>
                    <span className="text-ink-300">{v.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-paper-100 flex items-center justify-center">
              <ArrowLeftRight size={16} className="text-ink-300" />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setRightVersionOpen(!rightVersionOpen)}
              className="w-full p-3 border border-paper-200 rounded-sm text-left flex items-center justify-between hover:border-ink-100 transition-colors bg-white"
            >
              <div>
                <span className="font-mono text-sm text-brand-orange font-medium">
                  v{rightVersion?.number}
                </span>
                <span className="mx-2 text-ink-100">·</span>
                <span className="text-sm text-ink-300">{rightVersion?.name}</span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-ink-50 transition-transform",
                  rightVersionOpen && "rotate-180"
                )}
              />
            </button>
            {rightVersionOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-paper-200 rounded-sm shadow-card z-10 max-h-64 overflow-y-auto">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setCompareVersions(compareVersionIds[0], v.id);
                      setRightVersionOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 text-left text-sm hover:bg-paper-50 transition-colors",
                      v.id === compareVersionIds[1] && "bg-paper-100"
                    )}
                  >
                    <span className="font-mono text-brand-orange font-medium">
                      v{v.number}
                    </span>
                    <span className="mx-2 text-ink-100">·</span>
                    <span className="text-ink-300">{v.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="px-4 py-2 bg-paper-100 border-b border-paper-200 flex items-center justify-between">
            <span className="text-xs text-ink-50 font-mono">
              {leftDesigns.length} 个方案
            </span>
            <span className="text-xs text-ink-50 font-mono">
              {leftVersion && formatDate(leftVersion.createdAt)}
            </span>
          </div>
          <div
            ref={leftPanelRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-50"
          >
            {leftDesigns.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card overflow-hidden"
              >
                <img
                  src={design.imageUrl}
                  alt={design.title}
                  className="w-full h-auto"
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink-300">
                    {design.title}
                  </p>
                  <p className="text-xs text-ink-50 font-mono mt-1">
                    v{design.version}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div
          className={cn(
            "w-1 bg-paper-200 relative cursor-col-resize group",
            isDragging && "bg-brand-orange"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-paper-200 rounded-full flex items-center justify-center shadow-md group-hover:border-brand-orange transition-colors z-10">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-paper-300 rounded" />
              <div className="w-0.5 h-4 bg-paper-300 rounded" />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <div className="px-4 py-2 bg-paper-100 border-b border-paper-200 flex items-center justify-between">
            <span className="text-xs text-ink-50 font-mono">
              {rightDesigns.length} 个方案
            </span>
            <span className="text-xs text-ink-50 font-mono">
              {rightVersion && formatDate(rightVersion.createdAt)}
            </span>
          </div>
          <div
            ref={rightPanelRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-50"
          >
            {rightDesigns.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card overflow-hidden"
              >
                <img
                  src={design.imageUrl}
                  alt={design.title}
                  className="w-full h-auto"
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink-300">
                    {design.title}
                  </p>
                  <p className="text-xs text-ink-50 font-mono mt-1">
                    v{design.version}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-72 border-t border-paper-200 bg-white flex flex-col"
      >
        <div className="px-6 py-3 border-b border-paper-200 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-ink-300">差异摘要</h2>
            <p className="text-xs text-ink-50 mt-0.5">
              {confirmedCount} / {allChanges.length} 项已确认
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-64 h-1.5 bg-paper-200 rounded-full overflow-hidden">
              <span
                className="h-full bg-brand-mint block transition-all duration-300"
                style={{
                  width: `${
                    allChanges.length > 0
                      ? (confirmedCount / allChanges.length) * 100
                      : 0
                  }%`,
                }}
              />
            </span>
            <span className="text-sm font-mono text-ink-300">
              {allChanges.length > 0
                ? Math.round((confirmedCount / allChanges.length) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-3">
                v{leftVersion?.number} 改动
              </p>
              <div className="space-y-2">
                {leftVersion?.changes.map((change) => {
                  const Icon = changeTypeIcon(change.type);
                  return (
                    <motion.div
                      key={change.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-3 rounded-sm border transition-colors",
                        change.confirmed
                          ? "bg-brand-mint/5 border-brand-mint/30"
                          : "bg-paper-50 border-paper-200 hover:border-ink-100"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleChangeConfirmed(change.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {change.confirmed ? (
                            <CheckCircle2
                              size={16}
                              className="text-brand-mint"
                            />
                          ) : (
                            <Circle
                              size={16}
                              className="text-ink-50 hover:text-brand-orange transition-colors"
                            />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              size={12}
                              className={getChangeTypeColor(change.type)}
                            />
                            <span
                              className={cn(
                                "text-xs font-mono uppercase",
                                getChangeTypeColor(change.type)
                              )}
                            >
                              {getChangeTypeLabel(change.type)}
                            </span>
                          </div>
                          <p className="text-sm text-ink-300 line-clamp-2">
                            {change.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-3">
                v{rightVersion?.number} 改动
              </p>
              <div className="space-y-2">
                {rightVersion?.changes.map((change) => {
                  const Icon = changeTypeIcon(change.type);
                  return (
                    <motion.div
                      key={change.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-3 rounded-sm border transition-colors",
                        change.confirmed
                          ? "bg-brand-mint/5 border-brand-mint/30"
                          : "bg-paper-50 border-paper-200 hover:border-ink-100"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleChangeConfirmed(change.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {change.confirmed ? (
                            <CheckCircle2
                              size={16}
                              className="text-brand-mint"
                            />
                          ) : (
                            <Circle
                              size={16}
                              className="text-ink-50 hover:text-brand-orange transition-colors"
                            />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              size={12}
                              className={getChangeTypeColor(change.type)}
                            />
                            <span
                              className={cn(
                                "text-xs font-mono uppercase",
                                getChangeTypeColor(change.type)
                              )}
                            >
                              {getChangeTypeLabel(change.type)}
                            </span>
                          </div>
                          <p className="text-sm text-ink-300 line-clamp-2">
                            {change.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
