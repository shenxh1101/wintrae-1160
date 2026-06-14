import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  CheckCircle2,
  Circle,
  Package,
  FileText,
  FileImage,
  Archive,
  Calendar,
  User,
  CheckSquare,
  Clock,
} from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { cn, formatDate, formatDateTime } from "../utils/helpers";

export function Delivery() {
  const {
    project,
    deliveryItems,
    toggleDeliveryCompleted,
    confirmAllDeliveries,
  } = useProjectStore();

  const [signature, setSignature] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const completedCount = deliveryItems.filter((i) => i.completed).length;
  const totalSize = deliveryItems.reduce((sum, item) => {
    const size = parseFloat(item.fileSize);
    return sum + size;
  }, 0);

  const fileTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return FileText;
      case "FIG":
        return FileImage;
      case "ZIP":
        return Archive;
      default:
        return Package;
    }
  };

  const handleConfirmDelivery = () => {
    if (completedCount < deliveryItems.length) {
      alert("请先确认所有交付项");
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalConfirm = () => {
    if (!signature.trim()) {
      alert("请输入确认签名");
      return;
    }
    confirmAllDeliveries();
    setDelivered(true);
    setIsConfirming(false);
  };

  if (delivered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-mint/10 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-brand-mint" />
          </div>
          <h1 className="text-3xl font-display text-ink-300 mb-3">
            项目已成功交付
          </h1>
          <p className="text-ink-50 mb-8">
            感谢您的合作！所有设计文件已确认并归档。
          </p>
          <div className="card p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ink-50">项目名称</span>
              <span className="text-ink-300 font-medium">{project.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-50">客户</span>
              <span className="text-ink-300">{project.client}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-50">确认人</span>
              <span className="text-ink-300 font-mono">{signature}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-50">交付时间</span>
              <span className="text-ink-300 font-mono">
                {formatDateTime(new Date().toISOString())}
              </span>
            </div>
            <div className="pt-4 border-t border-paper-200">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn"
              >
                返回项目首页
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-ink-50 mb-1">
                交付确认
              </p>
              <h1 className="text-3xl font-display text-ink-300">
                项目交付与验收
              </h1>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ink-50 text-sm mb-1">交付项</p>
                <p className="text-3xl font-display font-bold text-ink-300">
                  {completedCount}/{deliveryItems.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center">
                <Package size={22} className="text-brand-orange" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ink-50 text-sm mb-1">总大小</p>
                <p className="text-3xl font-display font-bold text-ink-300">
                  {totalSize.toFixed(1)} MB
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-mint/10 flex items-center justify-center">
                <FileText size={22} className="text-brand-mint" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ink-50 text-sm mb-1">完成度</p>
                <p className="text-3xl font-display font-bold text-ink-300">
                  {deliveryItems.length > 0
                    ? Math.round((completedCount / deliveryItems.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-coral/10 flex items-center justify-center">
                <CheckSquare size={22} className="text-brand-coral" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-8"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display text-ink-300">
                  交付内容清单
                </h2>
                <button className="btn btn-primary flex items-center gap-2">
                  <Download size={14} />
                  下载全部
                </button>
              </div>

              <div className="space-y-3">
                {deliveryItems.map((item, index) => {
                  const Icon = fileTypeIcon(item.fileType);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={cn(
                        "p-4 rounded-sm border transition-all",
                        item.completed
                          ? "bg-brand-mint/5 border-brand-mint/30"
                          : "bg-paper-50 border-paper-200 hover:border-ink-100"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleDeliveryCompleted(item.id)}
                          className="flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle2 size={20} className="text-brand-mint" />
                          ) : (
                            <Circle
                              size={20}
                              className="text-ink-50 hover:text-brand-orange transition-colors"
                            />
                          )}
                        </button>

                        <div
                          className={cn(
                            "w-12 h-12 rounded-sm flex items-center justify-center",
                            item.completed
                              ? "bg-brand-mint/10"
                              : "bg-paper-100"
                          )}
                        >
                          <Icon
                            size={20}
                            className={
                              item.completed ? "text-brand-mint" : "text-ink-300"
                            }
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              "font-medium",
                              item.completed
                                ? "text-ink-100 line-through"
                                : "text-ink-300"
                            )}
                          >
                            {item.name}
                          </h4>
                          <p className="text-sm text-ink-50">{item.description}</p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-mono text-ink-50">
                            {item.fileType} · {item.fileSize}
                          </p>
                          <button
                            className="text-xs text-brand-orange hover:underline mt-1 flex items-center gap-1 ml-auto"
                          >
                            <Download size={10} />
                            下载
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-4 space-y-6"
          >
            <div className="card p-6">
              <h2 className="text-lg font-display text-ink-300 mb-4">
                项目信息
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">项目周期</p>
                    <p className="text-sm text-ink-300 font-mono">
                      {formatDate(project.startDate)} -{" "}
                      {formatDate(project.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">客户</p>
                    <p className="text-sm text-ink-300">{project.client}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">当前状态</p>
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-display text-ink-300 mb-4">
                确认交付
              </h2>
              <p className="text-sm text-ink-50 mb-4">
                请确认所有交付内容无误后，输入您的签名并点击确认通过。
              </p>

              <div className="mb-4">
                <label className="text-xs text-ink-50 block mb-2">
                  确认签名
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="请输入您的姓名..."
                  className="w-full px-3 py-2 border border-paper-200 rounded-sm text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleConfirmDelivery}
                  disabled={completedCount < deliveryItems.length}
                  className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={14} />
                  确认通过
                </button>
                <button
                  onClick={() =>
                    deliveryItems.forEach((item) => {
                      if (!item.completed) toggleDeliveryCompleted(item.id);
                    })
                  }
                  className="w-full btn text-sm"
                >
                  一键勾选全部
                </button>
              </div>
            </div>

            <div className="p-4 bg-paper-100 rounded-sm">
              <p className="text-xs text-ink-50 leading-relaxed">
                确认交付后，项目将标记为「已交付」状态，所有文件将被归档。
                如有任何问题，请先与设计师沟通。
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {isConfirming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-brand-charcoal/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsConfirming(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-sm p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-brand-orange" />
            </div>
            <h2 className="text-2xl font-display text-ink-300 text-center mb-2">
              确认交付？
            </h2>
            <p className="text-ink-50 text-center mb-6">
              确认人：<span className="font-mono">{signature}</span>
            </p>
            <p className="text-sm text-ink-50 text-center mb-6">
              确认后，所有交付项将被标记为已完成，项目状态将变更为「已交付」。此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirming(false)}
                className="flex-1 btn"
              >
                取消
              </button>
              <button
                onClick={handleFinalConfirm}
                className="flex-1 btn btn-primary"
              >
                确认交付
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
