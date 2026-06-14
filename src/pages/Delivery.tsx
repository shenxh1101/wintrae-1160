import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
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
  Loader2,
  ArrowLeft,
  History,
  FileDown,
  Building,
} from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { cn, formatDate, formatDateTime } from "../utils/helpers";
import type { DeliveryItem } from "../types";

export function Delivery() {
  const navigate = useNavigate();
  const {
    project,
    deliveryItems,
    deliveryRecord,
    toggleDeliveryCompleted,
    confirmAllDeliveries,
    addDownloadRecord,
  } = useProjectStore();

  const [signature, setSignature] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const isDelivered = project.status === "delivered" && deliveryRecord;

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

  const generatePDFFileContent = (item: DeliveryItem): string => {
    return `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 1000 >>
stream
BT
/F1 24 Tf
72 720 Td
(${project.title} - ${item.name}) Tj
0 -40 Td
/F1 12 Tf
(项目: ${project.title}) Tj
0 -20 Td
(客户: ${project.client}) Tj
0 -20 Td
(设计师: ${project.designer.name}) Tj
0 -20 Td
(文件类型: ${item.fileType}) Tj
0 -20 Td
(文件大小: ${item.fileSize}) Tj
0 -40 Td
/F1 16 Tf
(文件描述:) Tj
0 -25 Td
/F1 12 Tf
(${item.description}) Tj
0 -40 Td
/F1 16 Tf
(备注:) Tj
0 -25 Td
/F1 12 Tf
(此为演示用 PDF 文件，实际项目中包含真实设计内容。) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000062 00000 n 
0000000111 00000 n 
0000000209 00000 n 
0000001200 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1300
%%EOF
`;
  };

  const generateZIPFileContent = async (item: DeliveryItem): Promise<Blob> => {
    const zip = new JSZip();
    zip.file("说明.txt", `
${item.name}
${"=".repeat(40)}
${item.description}

项目: ${project.title}
客户: ${project.client}
设计师: ${project.designer.name}
打包时间: ${new Date().toLocaleString("zh-CN")}

此 ZIP 包包含:
- 设计源文件
- 导出资源
- 使用说明文档
`);
    zip.file("设计稿/设计图.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64"));
    zip.file("资源/素材.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#FF6B35" width="100" height="100"/></svg>`);
    zip.file("使用说明.md", `# ${item.name}\n\n${item.description}\n`);
    return zip.generateAsync({ type: "blob" });
  };

  const generateFIGFileContent = (item: DeliveryItem): string => {
    return JSON.stringify(
      {
        schemaVersion: 0,
        document: {
          id: item.id,
          name: item.name,
          type: "DOCUMENT",
          children: [
            {
              id: "page1",
              name: "Page 1",
              type: "CANVAS",
              children: [],
            },
          ],
        },
        meta: {
          project: project.title,
          client: project.client,
          designer: project.designer.name,
          description: item.description,
          exportedAt: new Date().toISOString(),
        },
      },
      null,
      2
    );
  };

  const generateFileBlob = async (item: DeliveryItem): Promise<Blob> => {
    const type = item.fileType.toUpperCase();
    if (type === "PDF") {
      return new Blob([generatePDFFileContent(item)], {
        type: "application/pdf",
      });
    } else if (type === "ZIP") {
      return generateZIPFileContent(item);
    } else if (type === "FIG") {
      return new Blob([generateFIGFileContent(item)], {
        type: "application/json",
      });
    }
    return new Blob(
      [
        `${item.name}\n${"=".repeat(40)}\n${item.description}\n\n项目: ${project.title}\n客户: ${project.client}\n设计师: ${project.designer.name}`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFile = async (item: DeliveryItem) => {
    if (downloadingId) return;
    setDownloadingId(item.id);
    setDownloadProgress(0);

    try {
      const blob = await generateFileBlob(item);
      triggerDownload(blob, item.fileName);

      if (deliveryRecord) {
        addDownloadRecord("single", [item.id]);
      }
    } catch (e) {
      console.error("下载失败:", e);
      alert("下载失败，请重试");
    }

    setDownloadingId(null);
    setDownloadProgress(0);
  };

  const downloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${project.title}-交付包`);

      if (!folder) throw new Error("无法创建文件夹");

      for (let i = 0; i < deliveryItems.length; i++) {
        const item = deliveryItems[i];
        const blob = await generateFileBlob(item);
        folder.file(item.fileName, blob);
        setDownloadProgress(Math.round(((i + 1) / deliveryItems.length) * 80));
      }

      const manifestContent = {
        project: project.title,
        client: project.client,
        designer: project.designer.name,
        designerContact: project.designer.avatar,
        generatedAt: new Date().toISOString(),
        totalFiles: deliveryItems.length,
        totalSize: `${totalSize.toFixed(1)} MB`,
        files: deliveryItems.map((item) => ({
          name: item.name,
          fileName: item.fileName,
          type: item.fileType,
          size: item.fileSize,
          description: item.description,
          completed: item.completed,
        })),
      };
      folder.file("交付清单.json", JSON.stringify(manifestContent, null, 2));

      const acceptanceContent = `
项目交付验收单
${"=".repeat(50)}

项目名称: ${project.title}
客户: ${project.client}
设计师: ${project.designer.name}

交付内容:
${deliveryItems.map((item, i) => `  ${i + 1}. ${item.name} (${item.fileType}, ${item.fileSize})`).join("\n")}

验收说明:
  - 所有设计文件已按要求完成
  - 源文件和导出文件均包含在内
  - 如有问题请在 7 个工作日内联系设计师

确认信息:
  确认人签名: ${deliveryRecord?.signature || "（待确认）"}
  确认时间: ${deliveryRecord ? formatDateTime(deliveryRecord.confirmedAt) : "（待确认）"}

生成时间: ${new Date().toLocaleString("zh-CN")}
`;
      folder.file("验收单.txt", acceptanceContent);

      setDownloadProgress(90);

      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 5 },
      });

      setDownloadProgress(100);

      triggerDownload(content, `${project.title}-完整交付包.zip`);

      if (deliveryRecord) {
        addDownloadRecord(
          "package",
          deliveryItems.map((i) => i.id)
        );
      }
    } catch (e) {
      console.error("批量下载失败:", e);
      alert("批量下载失败，请重试");
    }

    setTimeout(() => {
      setDownloadingAll(false);
      setDownloadProgress(0);
    }, 500);
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
    confirmAllDeliveries(signature);
    setIsConfirming(false);
  };

  useEffect(() => {
    if (deliveryRecord) {
      setSignature(deliveryRecord.signature);
    }
  }, [deliveryRecord]);

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
            <div className="flex items-center gap-3">
              {isDelivered && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={cn(
                    "btn flex items-center gap-2",
                    showHistory && "bg-paper-100"
                  )}
                >
                  <History size={14} />
                  下载记录
                </button>
              )}
              <StatusBadge status={project.status} />
            </div>
          </div>
        </motion.div>

        {isDelivered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8"
          >
            <div className="card p-6 bg-brand-mint/5 border-brand-mint/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-mint/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={24} className="text-brand-mint" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-ink-300 mb-2">
                    项目已交付完成
                  </h3>
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-ink-50 mb-1">确认人</p>
                      <p className="text-ink-300 font-mono">
                        {deliveryRecord?.signature}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-50 mb-1">交付时间</p>
                      <p className="text-ink-300 font-mono">
                        {deliveryRecord && formatDateTime(deliveryRecord.confirmedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-50 mb-1">下载次数</p>
                      <p className="text-ink-300 font-mono">
                        {deliveryRecord?.downloadRecords.length || 0} 次
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && deliveryRecord && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-8"
          >
            <h3 className="text-lg font-display text-ink-300 mb-4 flex items-center gap-2">
              <FileDown size={18} />
              下载历史记录
            </h3>
            {deliveryRecord.downloadRecords.length === 0 ? (
              <p className="text-ink-50 text-sm text-center py-6">
                暂无下载记录
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {deliveryRecord.downloadRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-paper-50 rounded-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                        <FileDown size={14} className="text-brand-orange" />
                      </div>
                      <div>
                        <p className="text-sm text-ink-300">
                          {record.type === "package" ? "完整交付包" : "单个文件下载"}
                        </p>
                        <p className="text-xs text-ink-50 font-mono">
                          {record.itemIds.length} 个文件 · {formatDateTime(record.downloadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src={record.downloadedBy.avatar}
                        alt={record.downloadedBy.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-ink-300">
                        {record.downloadedBy.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

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
                <button
                  onClick={downloadAll}
                  disabled={downloadingAll}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingAll ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {downloadProgress > 0 ? `打包中 ${downloadProgress}%` : "下载中..."}
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      下载全部
                    </>
                  )}
                </button>
              </div>

              {downloadingAll && downloadProgress > 0 && (
                <div className="mb-4">
                  <div className="w-full h-1.5 bg-paper-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      className="h-full bg-brand-orange rounded-full"
                    />
                  </div>
                </div>
              )}

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
                        {!isDelivered && (
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
                        )}
                        {isDelivered && (
                          <CheckCircle2
                            size={20}
                            className="text-brand-mint flex-shrink-0"
                          />
                        )}

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
                          <p className="text-xs text-ink-50/70 font-mono mt-1">
                            {item.fileName}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-mono text-ink-50">
                            {item.fileType} · {item.fileSize}
                          </p>
                          <button
                            onClick={() => downloadFile(item)}
                            disabled={downloadingId === item.id}
                            className="text-xs text-brand-orange hover:underline mt-1 flex items-center gap-1 ml-auto disabled:opacity-50"
                          >
                            {downloadingId === item.id ? (
                              <>
                                <Loader2 size={10} className="animate-spin" />
                                生成中
                              </>
                            ) : (
                              <>
                                <Download size={10} />
                                下载
                              </>
                            )}
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
                  <Building size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">客户</p>
                    <p className="text-sm text-ink-300">{project.client}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">设计师</p>
                    <p className="text-sm text-ink-300">
                      {project.designer.name}
                    </p>
                  </div>
                </div>
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
                  <Clock size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">当前状态</p>
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              </div>
            </div>

            {!isDelivered && (
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
            )}

            {isDelivered && (
              <div className="card p-6">
                <h2 className="text-lg font-display text-ink-300 mb-4">
                  交付操作
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={downloadAll}
                    disabled={downloadingAll}
                    className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingAll ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        打包中...
                      </>
                    ) : (
                      <>
                        <Package size={14} />
                        下载完整交付包
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full btn flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={14} />
                    返回项目首页
                  </button>
                </div>
              </div>
            )}

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
