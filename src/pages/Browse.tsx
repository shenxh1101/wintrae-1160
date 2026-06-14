import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  ZoomIn,
  MessageSquare,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  User,
} from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PriorityBadge } from "../components/ui/PriorityBadge";
import { cn, formatDateTime, getPriorityColor } from "../utils/helpers";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Annotation } from "../types";

export function Browse() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    designGroups,
    activeGroupId,
    activeDesignId,
    selectedAnnotationId,
    setActiveGroup,
    setActiveDesign,
    setSelectedAnnotation,
    openLightbox,
    addAnnotation,
    addComment,
    updateAnnotationStatus,
    getDesignGroupByDesignId,
    getAnnotationById,
  } = useProjectStore();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(designGroups.map((g) => g.id))
  );
  const [annotationMode, setAnnotationMode] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState<{
    designId: string;
    x: number;
    y: number;
  } | null>(null);
  const [annotationContent, setAnnotationContent] = useState("");
  const [annotationPriority, setAnnotationPriority] = useState<
    Annotation["priority"]
  >("medium");
  const [replyContent, setReplyContent] = useState("");
  const [highlightedAnnotationId, setHighlightedAnnotationId] = useState<
    string | null
  >(null);
  const [highlightedDesignId, setHighlightedDesignId] = useState<string | null>(
    null
  );
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

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
  const selectedAnnotation = activeDesign?.annotations.find(
    (a) => a.id === selectedAnnotationId
  );

  const handleImageClick = (
    e: React.MouseEvent<HTMLDivElement>,
    designId: string
  ) => {
    if (!annotationMode) {
      const group = getDesignGroupByDesignId(designId);
      if (group) {
        setActiveGroup(group.id);
      }
      setActiveDesign(designId);
      setSelectedAnnotation(null);
      const design = activeGroup?.designs.find((d) => d.id === designId);
      if (design) {
        openLightbox(design.imageUrl, design.title);
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const group = getDesignGroupByDesignId(designId);
    if (group) {
      setActiveGroup(group.id);
    }
    setActiveDesign(designId);
    setNewAnnotation({ designId, x, y });
    setAnnotationContent("");
    setAnnotationPriority("medium");
  };

  const handleAnnotationPointClick = (
    e: React.MouseEvent,
    annotation: Annotation,
    designId: string
  ) => {
    e.stopPropagation();
    const group = getDesignGroupByDesignId(designId);
    if (group) {
      setActiveGroup(group.id);
    }
    setActiveDesign(designId);
    setSelectedAnnotation(annotation.id);
  };

  const submitAnnotation = () => {
    if (!newAnnotation || !annotationContent.trim()) return;

    addAnnotation(
      newAnnotation.designId,
      newAnnotation.x,
      newAnnotation.y,
      annotationContent.trim(),
      annotationPriority
    );

    setNewAnnotation(null);
    setAnnotationContent("");
    setAnnotationPriority("medium");
  };

  const cancelAnnotation = () => {
    setNewAnnotation(null);
    setAnnotationContent("");
    setAnnotationPriority("medium");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelAnnotation();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      submitAnnotation();
    }
  };

  const submitReply = () => {
    if (!selectedAnnotationId || !replyContent.trim()) return;
    addComment(selectedAnnotationId, replyContent.trim());
    setReplyContent("");
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      submitReply();
    }
  };

  useEffect(() => {
    const designId = searchParams.get("designId");
    const annotationId = searchParams.get("annotationId");

    if (designId) {
      const group = getDesignGroupByDesignId(designId);
      if (group) {
        setActiveGroup(group.id);
        setExpandedGroups((prev) => new Set([...prev, group.id]));
        setActiveDesign(designId);

        setHighlightedDesignId(designId);
        setTimeout(() => setHighlightedDesignId(null), 3000);

        if (annotationId) {
          const annotation = getAnnotationById(annotationId);
          if (annotation) {
            setSelectedAnnotation(annotationId);
            setHighlightedAnnotationId(annotationId);
            setTimeout(() => setHighlightedAnnotationId(null), 3000);
          }
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeDesignId) {
      params.set("designId", activeDesignId);
    }
    if (selectedAnnotationId) {
      params.set("annotationId", selectedAnnotationId);
    }
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [activeDesignId, selectedAnnotationId]);

  useEffect(() => {
    if (selectedAnnotationId && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [selectedAnnotationId]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-72 border-r border-paper-200 bg-white/50 overflow-y-auto flex-shrink-0">
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
                        setSelectedAnnotation(null);
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAnnotationMode(!annotationMode)}
                    className={cn(
                      "btn flex items-center gap-2 transition-all",
                      annotationMode &&
                        "bg-brand-orange text-white border-brand-orange hover:bg-brand-orange/90"
                    )}
                  >
                    {annotationMode ? (
                      <>
                        <X size={14} /> 退出批注
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> 开启批注
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate("/comments")}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <MessageSquare size={14} /> 查看全部
                  </button>
                </div>
              </div>
              {annotationMode && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-brand-orange flex items-center gap-2"
                >
                  <AlertCircle size={14} />
                  批注模式已开启，点击设计图任意位置添加批注
                </motion.p>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              {activeGroup.designs.map((design, index) => {
                const isHighlighted = highlightedDesignId === design.id;
                return (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isHighlighted ? [1, 1.02, 1] : 1,
                    boxShadow: isHighlighted
                      ? ["0 0 0 0 rgba(247,147,30,0.4)", "0 0 0 16px rgba(247,147,30,0)"]
                      : undefined,
                  }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    ...(isHighlighted && {
                      scale: { duration: 0.6, times: [0, 0.3, 0.6] },
                      boxShadow: { duration: 1.5, repeat: 1 },
                    }),
                  }}
                  className={cn(
                    "card group overflow-hidden relative",
                    activeDesignId === design.id && "ring-2 ring-brand-orange",
                    isHighlighted && "ring-4 ring-brand-orange/60"
                  )}
                >
                  <div
                    className={cn(
                      "relative aspect-[3/2] overflow-hidden",
                      annotationMode ? "cursor-crosshair" : "cursor-pointer"
                    )}
                    onClick={(e) => handleImageClick(e, design.id)}
                  >
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-500",
                        !annotationMode && "group-hover:scale-105"
                      )}
                      draggable={false}
                    />

                    {!annotationMode && (
                      <div className="absolute inset-0 bg-brand-charcoal/0 group-hover:bg-brand-charcoal/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn size={20} className="text-ink-300" />
                        </div>
                      </div>
                    )}

                    {annotationMode && (
                      <div className="absolute inset-0 bg-brand-orange/5 border-2 border-brand-orange/40 transition-all" />
                    )}

                    {design.annotations.map((annotation) => {
                      const isHighlighted = highlightedAnnotationId === annotation.id;
                      return (
                        <div
                          key={annotation.id}
                          className="absolute"
                          style={{
                            left: `${annotation.x}%`,
                            top: `${annotation.y}%`,
                          }}
                        >
                          {isHighlighted && (
                            <div
                              className={cn(
                                "absolute w-6 h-6 -ml-3 -mt-3 rounded-full animate-pulse-ring",
                                getPriorityColor(annotation.priority).bg
                              )}
                            />
                          )}
                          <button
                            onClick={(e) =>
                              handleAnnotationPointClick(e, annotation, design.id)
                            }
                            className={cn(
                              "absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg transform transition-all",
                              "flex items-center justify-center text-white text-[10px] font-bold font-mono z-10",
                              "hover:scale-125",
                              selectedAnnotationId === annotation.id &&
                                "ring-2 ring-white ring-offset-1 scale-110",
                              isHighlighted && "animate-bounce-in scale-125 ring-4 ring-white ring-offset-2",
                              getPriorityColor(annotation.priority).bg
                            )}
                            title={annotation.content}
                          >
                            {annotation.status === "resolved" ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <span>{annotation.comments.length + 1}</span>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {newAnnotation?.designId === design.id && (
                      <div
                        className={cn(
                          "absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg animate-pulse",
                          "flex items-center justify-center z-20",
                          getPriorityColor(annotationPriority).bg
                        )}
                        style={{
                          left: `${newAnnotation.x}%`,
                          top: `${newAnnotation.y}%`,
                        }}
                      >
                        <Plus size={12} className="text-white" />
                      </div>
                    )}

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
                )})}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-ink-50">
            请选择一个方案分组
          </div>
        )}
      </main>

      <AnimatePresence>
        {newAnnotation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-8 right-8 w-96 bg-white rounded-lg shadow-xl border border-paper-200 p-5 z-50"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-ink-300 flex items-center gap-2">
                <Plus size={16} className="text-brand-orange" />
                添加批注
              </h3>
              <button
                onClick={cancelAnnotation}
                className="text-ink-50 hover:text-ink-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-ink-50 mb-1">批注内容</p>
                <textarea
                  autoFocus
                  value={annotationContent}
                  onChange={(e) => setAnnotationContent(e.target.value)}
                  placeholder="请输入你的意见或建议..."
                  className="w-full h-24 px-3 py-2 border border-paper-200 rounded-sm text-sm text-ink-300 placeholder:text-ink-50 focus:outline-none focus:border-brand-orange resize-none"
                />
              </div>

              <div>
                <p className="text-xs text-ink-50 mb-2">优先级</p>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setAnnotationPriority(p)}
                      className={cn(
                        "flex-1 px-3 py-2 text-sm border rounded-sm transition-all",
                        annotationPriority === p
                          ? "border-transparent text-white"
                          : "border-paper-200 text-ink-300 hover:border-paper-300",
                        getPriorityColor(p).bg
                      )}
                    >
                      {p === "high" ? "高" : p === "medium" ? "中" : "低"}优先级
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={cancelAnnotation}
                  className="flex-1 btn text-sm"
                >
                  取消
                </button>
                <button
                  onClick={submitAnnotation}
                  disabled={!annotationContent.trim()}
                  className="flex-1 btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交批注
                </button>
              </div>
            </div>

            <p className="text-xs text-ink-50 mt-3 font-mono">
              ESC 取消 · Cmd/Ctrl + Enter 提交
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeDesign && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-paper-200 bg-white/80 backdrop-blur-sm overflow-hidden flex-shrink-0"
          >
            <div className="w-[380px] h-full flex flex-col">
              {selectedAnnotation ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-paper-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAnnotation(null)}
                        className="text-ink-50 hover:text-ink-300 transition-colors"
                      >
                        <ChevronRight size={14} className="rotate-180" />
                      </button>
                      <h2 className="text-xs font-mono uppercase tracking-wider text-ink-50">
                        批注讨论
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedAnnotation(null)}
                      className="text-ink-50 hover:text-ink-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-4 border-b border-paper-200">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-ink-300 font-medium">
                        {selectedAnnotation.content}
                      </p>
                      <PriorityBadge
                        priority={selectedAnnotation.priority}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-50 mb-3">
                      <img
                        src={selectedAnnotation.author.avatar}
                        alt={selectedAnnotation.author.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{selectedAnnotation.author.name}</span>
                      <span>·</span>
                      <span className="font-mono">
                        {formatDateTime(selectedAnnotation.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedAnnotation.status} size="sm" />
                      {selectedAnnotation.status !== "resolved" && (
                        <button
                          onClick={() =>
                            updateAnnotationStatus(
                              selectedAnnotation.id,
                              "resolved"
                            )
                          }
                          className="text-xs text-brand-mint hover:underline flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} />
                          标记已解决
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-3">
                      {selectedAnnotation.comments.length === 0 ? (
                        <p className="text-sm text-ink-50 text-center py-6">
                          暂无回复，添加第一条评论吧
                        </p>
                      ) : (
                        selectedAnnotation.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex gap-3"
                          >
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="w-8 h-8 rounded-full flex-shrink-0"
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
                              <p className="text-sm text-ink-300 bg-paper-50 p-3 rounded-sm">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-paper-200">
                    <div className="flex gap-2">
                      <textarea
                        ref={commentInputRef}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={handleReplyKeyDown}
                        placeholder="输入评论..."
                        className="flex-1 h-20 px-3 py-2 border border-paper-200 rounded-sm text-sm text-ink-300 placeholder:text-ink-50 focus:outline-none focus:border-brand-orange resize-none"
                      />
                      <button
                        onClick={submitReply}
                        disabled={!replyContent.trim()}
                        className="self-end w-10 h-10 rounded-sm bg-brand-orange text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-orange/90 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-ink-50 mt-2 font-mono">
                      Cmd/Ctrl + Enter 发送
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-paper-200">
                    <h2 className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
                      方案详情
                    </h2>
                    <p className="text-lg font-medium text-ink-300">
                      {activeDesign.title}
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={activeDesign.status} />
                      <span className="text-ink-50 font-mono text-xs">
                        v{activeDesign.version}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-ink-50 mb-1">描述</p>
                      <p className="text-ink-300 text-sm">
                        {activeDesign.description}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-ink-50">批注列表</p>
                        <span className="text-xs font-mono text-ink-50">
                          {activeDesign.annotations.length} 条
                        </span>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {activeDesign.annotations.length === 0 ? (
                          <p className="text-sm text-ink-50 text-center py-6">
                            暂无批注
                          </p>
                        ) : (
                          activeDesign.annotations.map((annotation) => (
                            <div
                              key={annotation.id}
                              onClick={() =>
                                setSelectedAnnotation(annotation.id)
                              }
                              className={cn(
                                "p-3 rounded-sm border cursor-pointer transition-colors",
                                selectedAnnotationId === annotation.id
                                  ? "bg-brand-orange/5 border-brand-orange/30"
                                  : "bg-paper-50 border-paper-100 hover:bg-paper-100"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm text-ink-300 line-clamp-2">
                                  {annotation.content}
                                </p>
                                <PriorityBadge
                                  priority={annotation.priority}
                                  size="sm"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-ink-50">
                                <img
                                  src={annotation.author.avatar}
                                  alt={annotation.author.name}
                                  className="w-4 h-4 rounded-full"
                                />
                                <span>{annotation.author.name}</span>
                                <span>·</span>
                                <StatusBadge
                                  status={annotation.status}
                                  size="sm"
                                />
                                <span className="ml-auto flex items-center gap-1">
                                  <MessageSquare size={10} />
                                  {annotation.comments.length}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() =>
                          openLightbox(
                            activeDesign.imageUrl,
                            activeDesign.title
                          )
                        }
                        className="w-full btn flex items-center justify-center gap-2"
                      >
                        <ZoomIn size={14} /> 查看大图
                      </button>
                      <button
                        onClick={() => setAnnotationMode(true)}
                        className="w-full btn btn-primary flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> 添加批注
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
