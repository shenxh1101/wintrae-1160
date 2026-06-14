export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return formatDate(dateString);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "草稿",
    review: "审核中",
    revision: "修改中",
    approved: "已通过",
    delivered: "已交付",
    pending: "待确认",
    open: "待处理",
    resolved: "已解决",
    closed: "已关闭",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-ink-50 text-ink-300",
    review: "bg-brand-yellow/20 text-ink-300",
    revision: "bg-brand-coral/20 text-brand-coral",
    approved: "bg-brand-mint/20 text-brand-mint",
    delivered: "bg-brand-mint/20 text-brand-mint",
    pending: "bg-brand-yellow/20 text-ink-300",
    open: "bg-brand-coral/20 text-brand-coral",
    resolved: "bg-brand-mint/20 text-brand-mint",
    closed: "bg-ink-50 text-ink-100",
  };
  return colors[status] || "bg-ink-50 text-ink-300";
}

export function getPriorityColor(priority: string): { bg: string; text: string; full: string } {
  const colors: Record<string, { bg: string; text: string; full: string }> = {
    high: { bg: "bg-brand-coral", text: "text-white", full: "bg-brand-coral text-white" },
    medium: { bg: "bg-brand-yellow", text: "text-ink-300", full: "bg-brand-yellow text-ink-300" },
    low: { bg: "bg-ink-50", text: "text-ink-300", full: "bg-ink-50 text-ink-300" },
  };
  return colors[priority] || colors.low;
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级",
  };
  return labels[priority] || priority;
}

export function getChangeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    added: "新增",
    modified: "修改",
    removed: "移除",
  };
  return labels[type] || type;
}

export function getChangeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    added: "text-brand-mint",
    modified: "text-brand-orange",
    removed: "text-brand-coral",
  };
  return colors[type] || "text-ink-300";
}

export function getTimelineIcon(type: string): string {
  const icons: Record<string, string> = {
    version: "Layers",
    annotation: "MessageSquare",
    status: "CircleDot",
    delivery: "Package",
  };
  return icons[type] || "Circle";
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
