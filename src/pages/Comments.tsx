import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PriorityBadge } from "../components/ui/PriorityBadge";
import {
  cn,
  formatDateTime,
  formatRelativeTime,
  getStatusLabel,
} from "../utils/helpers";
import type { Annotation } from "../types";

export function Comments() {
  const {
    designGroups,
    activeDesignId,
    setActiveDesign,
    selectedAnnotationId,
    setSelectedAnnotation,
    addComment,
    addAnnotation,
    updateAnnotationStatus,
  } = useProjectStore();

  const [newComment, setNewComment] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [newAnnotationContent, setNewAnnotationContent] = useState("");
  const [newAnnotationPriority, setNewAnnotationPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [newAnnotationPosition, setNewAnnotationPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);

  const allDesigns = designGroups.flatMap((g) => g.designs);
  const activeDesign = allDesigns.find((d) => d.id === activeDesignId);
  const selectedAnnotation = activeDesign?.annotations.find(
    (a) => a.id === selectedAnnotationId
  );

  const filteredAnnotations = (activeDesign?.annotations || []).filter((ann) => {
    if (filterStatus !== "all" && ann.status !== filterStatus) return false;
    if (filterPriority !== "all" && ann.priority !== filterPriority) return false;
    if (
      searchQuery &&
      !ann.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !activeDesign) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewAnnotationPosition({ x, y });
    setIsAddingAnnotation(true);
  };

  const handleSubmitAnnotation = () => {
    if (!activeDesign || !newAnnotationPosition || !newAnnotationContent.trim())
      return;

    addAnnotation(
      activeDesign.id,
      newAnnotationPosition.x,
      newAnnotationPosition.y,
      newAnnotationContent,
      newAnnotationPriority
    );

    setNewAnnotationContent("");
    setNewAnnotationPosition(null);
    setIsAddingAnnotation(false);
    setNewAnnotationPriority("medium");
  };

  const handleSubmitComment = () => {
    if (!selectedAnnotationId || !newComment.trim()) return;
    addComment(selectedAnnotationId, newComment);
    setNewComment("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddingAnnotation) {
        setIsAddingAnnotation(false);
        setNewAnnotationPosition(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddingAnnotation]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
                  批注讨论
                </p>
                <h1 className="text-3xl font-display text-ink-300">
                  {activeDesign?.title || "选择方案查看批注"}
                </h1>
              </div>
              {activeDesign && (
                <div className="flex items-center gap-3">
                  <StatusBadge status={activeDesign.status} />
                  <span className="text-sm text-ink-50 font-mono">
                    v{activeDesign.version}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {activeDesign ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div
                ref={imageRef}
                className="relative bg-white rounded-sm overflow-hidden shadow-card cursor-crosshair"
                onClick={handleImageClick}
              >
                <img
                  src={activeDesign.imageUrl}
                  alt={activeDesign.title}
                  className="w-full h-auto select-none pointer-events-none"
                  draggable={false}
                />

                {activeDesign.annotations.map((annotation, index) => (
                  <motion.button
                    key={annotation.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotation(annotation.id);
                    }}
                    className={cn(
                      "absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all z-10",
                      selectedAnnotationId === annotation.id
                        ? "ring-4 ring-white/50 scale-110"
                        : "hover:scale-110",
                      annotation.priority === "high" && "bg-brand-coral",
                      annotation.priority === "medium" && "bg-brand-orange",
                      annotation.priority === "low" && "bg-ink-50",
                      annotation.status === "resolved" && "bg-brand-mint"
                    )}
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {index + 1}
                  </motion.button>
                ))}

                {newAnnotationPosition && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center text-xs font-medium text-white ring-4 ring-white/50 z-20"
                    style={{
                      left: `${newAnnotationPosition.x}%`,
                      top: `${newAnnotationPosition.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    +
                  </motion.div>
                )}
              </div>

              <p className="text-center text-ink-50 text-sm mt-4">
                点击图片任意位置添加批注 · 当前方案共{" "}
                {activeDesign.annotations.length} 条批注
              </p>
            </motion.div>
          ) : (
            <div className="h-96 flex items-center justify-center text-ink-50">
              请从右侧选择一个方案查看批注
            </div>
          )}
        </div>
      </main>

      <aside className="w-[420px] border-l border-paper-200 bg-white flex flex-col">
        <div className="p-4 border-b border-paper-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-ink-300">方案列表</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-1.5 transition-colors",
                showFilters ? "text-brand-orange" : "text-ink-50 hover:text-ink-300"
              )}
            >
              <Filter size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-50"
              />
              <input
                type="text"
                placeholder="搜索批注..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-paper-200 rounded-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-ink-50 block mb-1">
                        状态
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-paper-200 rounded-sm focus:outline-none focus:border-brand-orange"
                      >
                        <option value="all">全部</option>
                        <option value="open">待处理</option>
                        <option value="resolved">已解决</option>
                        <option value="closed">已关闭</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-ink-50 block mb-">
                        优先级
                      </label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-paper-200 rounded-sm focus:outline-none focus:border-brand-orange"
                      >
                        <option value="all">全部</option>
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {allDesigns.map((design) => (
              <div key={design.id} className="mb-4">
                <button
                  onClick={() => {
                    setActiveDesign(design.id);
                    setSelectedAnnotation(null);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-sm transition-colors mb-2 flex items-center justify-between",
                    activeDesignId === design.id
                      ? "bg-paper-100"
                      : "hover:bg-paper-50"
                  )}
                >
                  <span className="text-sm font-medium text-ink-300">
                    {design.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-50 font-mono">
                      v{design.version}
                    </span>
                    {design.annotations.length > 0 && (
                      <span className="text-xs bg-paper-200 text-ink-300 px-2 py-0.5 rounded-full font-mono">
                        {design.annotations.length}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-ink-50 transition-transform",
                        activeDesignId === design.id && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {activeDesignId === design.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    {filteredAnnotations.length > 0 ? (
                      filteredAnnotations.map((annotation, index) => (
                        <motion.div
                          key={annotation.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => setSelectedAnnotation(annotation.id)}
                          className={cn(
                            "p-3 rounded-sm cursor-pointer transition-all border-l-2",
                            selectedAnnotationId === annotation.id
                              ? "bg-paper-100 border-l-brand-orange"
                              : "hover:bg-paper-50 border-l-transparent"
                          )}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0",
                                annotation.priority === "high" && "bg-brand-coral",
                                annotation.priority === "medium" &&
                                  "bg-brand-orange",
                                annotation.priority === "low" && "bg-ink-50",
                                annotation.status === "resolved" &&
                                  "bg-brand-mint"
                              )}
                            >
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ink-300 line-clamp-2">
                                {annotation.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-7">
                            <PriorityBadge
                              priority={annotation.priority}
                              className="text-[10px]"
                            />
                            <StatusBadge
                              status={annotation.status}
                              className="text-[10px]"
                            />
                            <span className="text-[10px] text-ink-50 font-mono ml-auto">
                              {formatRelativeTime(annotation.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-ink-50 text-sm py-4">
                        暂无匹配的批注
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {isAddingAnnotation && newAnnotationPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-charcoal/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsAddingAnnotation(false);
              setNewAnnotationPosition(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-sm p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-display text-ink-300 mb-4">添加批注</h3>
              <textarea
                autoFocus
                value={newAnnotationContent}
                onChange={(e) => setNewAnnotationContent(e.target.value)}
                placeholder="请输入批注内容..."
                className="w-full p-3 border border-paper-200 rounded-sm text-sm resize-none h-24 focus:outline-none focus:border-brand-orange transition-colors mb-4"
              />
              <div className="mb-4">
                <label className="text-sm text-ink-50 block mb-2">优先级</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewAnnotationPriority(p)}
                      className={cn(
                        "flex-1 py-2 text-sm rounded-sm border transition-all",
                        newAnnotationPriority === p
                          ? cn(
                              p === "high" && "bg-brand-coral text-white border-brand-coral",
                              p === "medium" && "bg-brand-orange text-white border-brand-orange",
                              p === "low" && "bg-ink-50 text-white border-ink-50"
                            )
                          : "border-paper-200 text-ink-300 hover:border-ink-100"
                      )}
                    >
                      {p === "high" && "高"}
                      {p === "medium" && "中"}
                      {p === "low" && "低"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAddingAnnotation(false);
                    setNewAnnotationPosition(null);
                  }}
                  className="flex-1 btn"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitAnnotation}
                  disabled={!newAnnotationContent.trim()}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交批注
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAnnotation && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-16 bottom-0 w-[420px] bg-white border-l border-paper-200 z-40 flex flex-col"
          >
            <div className="p-4 border-b border-paper-200 flex items-center justify-between">
              <h3 className="font-medium text-ink-300">批注详情</h3>
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="p-1 hover:bg-paper-100 rounded-sm transition-colors"
              >
                <X size={16} className="text-ink-50" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-paper-200">
                <div className="flex items-center gap-2 mb-3">
                  <PriorityBadge priority={selectedAnnotation.priority} />
                  <StatusBadge status={selectedAnnotation.status} />
                </div>
                <p className="text-ink-300 mb-4">{selectedAnnotation.content}</p>
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src={selectedAnnotation.author.avatar}
                    alt={selectedAnnotation.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-ink-300">
                    {selectedAnnotation.author.name}
                  </span>
                  <span className="text-xs text-ink-50 font-mono ml-auto">
                    {formatDateTime(selectedAnnotation.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateAnnotationStatus(
                        selectedAnnotation.id,
                        selectedAnnotation.status === "resolved" ? "open" : "resolved"
                      )
                    }
                    className={cn(
                      "flex-1 btn text-xs py-1.5 flex items-center justify-center gap-1",
                      selectedAnnotation.status === "resolved" &&
                        "bg-brand-mint/10 text-brand-mint border-brand-mint hover:bg-brand-mint hover:text-white"
                    )}
                  >
                    <CheckCircle2 size={12} />
                    {selectedAnnotation.status === "resolved"
                      ? "取消解决"
                      : "标记已解决"}
                  </button>
                  <button
                    onClick={() =>
                      updateAnnotationStatus(selectedAnnotation.id, "closed")
                    }
                    className="flex-1 btn text-xs py-1.5 flex items-center justify-center gap-1"
                  >
                    <Clock size={12} />
                    关闭
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-medium text-ink-300 mb-4">
                  讨论记录 ({selectedAnnotation.comments.length})
                </h4>
                <div className="space-y-4 mb-4">
                  {selectedAnnotation.comments.length > 0 ? (
                    selectedAnnotation.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-ink-300">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-ink-50 font-mono">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-ink-200 bg-paper-50 p-3 rounded-sm">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-ink-50 text-sm py-4">
                      暂无讨论
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSubmitComment()
                    }
                    placeholder="添加评论..."
                    className="flex-1 px-3 py-2 text-sm border border-paper-200 rounded-sm focus:outline-none focus:border-brand-orange transition-colors"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="w-10 h-10 bg-brand-orange text-white rounded-sm flex items-center justify-center hover:bg-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
