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
  FileCode,
  File,
  ChevronDown,
  ChevronRight,
  Receipt,
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
    currentUser,
    toggleDeliveryCompleted,
    confirmAllDeliveries,
    addDownloadRecord,
  } = useProjectStore();

  const [signature, setSignature] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(
    new Set()
  );

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

  const generateDirectoryListing = (): string => {
    const lines: string[] = [];
    lines.push(`${project.title} - 完整交付包`);
    lines.push("=".repeat(60));
    lines.push("");
    lines.push("目录结构:");
    lines.push("");
    lines.push(`${project.title}-交付包/`);
    lines.push("├── 设计文件/");
    deliveryItems.forEach((item, index) => {
      const prefix =
        index === deliveryItems.length - 1 ? "│   └── " : "│   ├── ";
      lines.push(`${prefix}${item.fileName} (${item.fileSize})`);
    });
    lines.push("├── 文档/");
    lines.push("│   ├── 交付清单.json");
    lines.push("│   ├── 验收单.txt");
    lines.push("│   └── 目录清单.txt");
    lines.push("└── 验收回执/");
    lines.push("    └── 验收回执.pdf");
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("文件统计:");
    lines.push(`  总文件数: ${deliveryItems.length + 4}`);
    lines.push(`  交付文件: ${deliveryItems.length} 个`);
    lines.push(`  文档文件: 4 个`);
    lines.push(`  总大小: ${totalSize.toFixed(1)} MB`);
    lines.push("");
    lines.push(`生成时间: ${new Date().toLocaleString("zh-CN")}`);
    return lines.join("\n");
  };

  const generateAcceptanceReceipt = (): string => {
    const downloadSummary = deliveryRecord?.downloadRecords || [];
    const downloadByUser = downloadSummary.reduce(
      (acc, record) => {
        const key = record.downloadedBy.name;
        if (!acc[key]) {
          acc[key] = { count: 0, files: 0, lastTime: "" };
        }
        acc[key].count += 1;
        acc[key].files += record.itemIds.length;
        acc[key].lastTime = record.downloadedAt;
        return acc;
      },
      {} as Record<string, { count: number; files: number; lastTime: string }>
    );

    return `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length 2000 >>
stream
BT
/F1 28 Tf
72 750 Td
(项目验收回执) Tj
0 -30 Td
/F2 12 Tf
(Project Acceptance Receipt) Tj
0 -50 Td
/F1 14 Tf
(项目信息) Tj
0 -25 Td
/F2 11 Tf
(项目名称: ${project.title}) Tj
0 -18 Td
(客户: ${project.client}) Tj
0 -18 Td
(设计师: ${project.designer.name}) Tj
0 -18 Td
(项目周期: ${formatDate(project.startDate)} - ${formatDate(project.endDate)}) Tj
0 -40 Td
/F1 14 Tf
(确认信息) Tj
0 -25 Td
/F2 11 Tf
(确认人签名: ${deliveryRecord?.signature || "（待确认）"}) Tj
0 -18 Td
(确认身份: ${
  deliveryRecord?.confirmedBy || currentUser.name
} (${deliveryRecord ? "已确认" : "待确认"})) Tj
0 -18 Td
(确认时间: ${
  deliveryRecord
    ? formatDateTime(deliveryRecord.confirmedAt)
    : "（待确认）"
}) Tj
0 -40 Td
/F1 14 Tf
(交付清单) Tj
0 -25 Td
/F2 11 Tf
${deliveryItems
  .map(
    (item, i) =>
      `(${i + 1}. ${item.name} - ${item.fileType} (${item.fileSize})) Tj\n0 -16 Td\n`
  )
  .join("")}
0 -20 Td
/F1 14 Tf
(下载摘要) Tj
0 -25 Td
/F2 11 Tf
${
  Object.keys(downloadByUser).length === 0
    ? "(暂无下载记录) Tj\n0 -18 Td\n"
    : Object.entries(downloadByUser)
        .map(
          ([user, data]) =>
            `(${user}: 下载 ${data.count} 次, 共 ${data.files} 个文件) Tj\n0 -18 Td\n(  最近: ${formatDateTime(data.lastTime)}) Tj\n0 -22 Td\n`
        )
        .join("")
}
0 -30 Td
/F2 10 Tf
(本回执由 DesignFlow 项目协作平台自动生成) Tj
0 -14 Td
(生成时间: ${new Date().toLocaleString("zh-CN")}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>
endobj
xref
0 7
0000000000 65535 f 
0000000015 00000 n 
0000000062 00000 n 
0000000111 00000 n 
0000000209 00000 n 
0000002300 00000 n 
0000002370 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
2450
%%EOF
`;
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
0 -20 Td
(文件名: ${item.fileName}) Tj
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
文件名: ${item.fileName}

此 ZIP 包包含:
- 设计源文件
- 导出资源
- 使用说明文档
`);
    zip.file(
      "设计稿/设计图.png",
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "base64"
      )
    );
    zip.file(
      "资源/素材.svg",
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#FF6B35" width="100" height="100"/></svg>`
    );
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
          fileName: item.fileName,
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
        type: "application/octet-stream",
      });
    }
    return new Blob(
      [
        `${item.name}\n${"=".repeat(40)}\n${item.description}\n\n文件名: ${item.fileName}\n项目: ${project.title}\n客户: ${project.client}\n设计师: ${project.designer.name}`,
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
        addDownloadRecord("single", [item.id], [item.fileName]);
      }
    } catch (e) {
      console.error("下载失败:", e);
      alert("下载失败，请重试");
    }

    setDownloadingId(null);
    setDownloadProgress(0);
  };

  const downloadReceipt = async () => {
    if (downloadingReceipt) return;
    setDownloadingReceipt(true);

    try {
      const blob = new Blob([generateAcceptanceReceipt()], {
        type: "application/pdf",
      });
      triggerDownload(blob, `${project.title}-验收回执.pdf`);
    } catch (e) {
      console.error("下载失败:", e);
      alert("下载失败，请重试");
    }

    setDownloadingReceipt(false);
  };

  const downloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${project.title}-交付包`);

      if (!folder) throw new Error("无法创建文件夹");

      const designFolder = folder.folder("设计文件");
      if (!designFolder) throw new Error("无法创建设计文件夹");

      for (let i = 0; i < deliveryItems.length; i++) {
        const item = deliveryItems[i];
        const blob = await generateFileBlob(item);
        designFolder.file(item.fileName, blob);
        setDownloadProgress(Math.round(((i + 1) / deliveryItems.length) * 70));
      }

      const docsFolder = folder.folder("文档");
      if (!docsFolder) throw new Error("无法创建文档文件夹");

      const manifestContent = {
        project: project.title,
        client: project.client,
        designer: project.designer.name,
        designerContact: project.designer.avatar,
        generatedAt: new Date().toISOString(),
        totalFiles: deliveryItems.length,
        totalSize: `${totalSize.toFixed(1)} MB`,
        directoryStructure: {
          [`${project.title}-交付包`]: {
            "设计文件": deliveryItems.map((i) => ({
              name: i.fileName,
              size: i.fileSize,
              type: i.fileType,
            })),
            文档: ["交付清单.json", "验收单.txt", "目录清单.txt"],
            "验收回执": ["验收回执.pdf"],
          },
        },
        files: deliveryItems.map((item) => ({
          name: item.name,
          fileName: item.fileName,
          type: item.fileType,
          size: item.fileSize,
          description: item.description,
          completed: item.completed,
        })),
      };
      docsFolder.file("交付清单.json", JSON.stringify(manifestContent, null, 2));

      const acceptanceContent = `
项目交付验收单
${"=".repeat(50)}

项目名称: ${project.title}
客户: ${project.client}
设计师: ${project.designer.name}

交付内容:
${deliveryItems
  .map((item, i) => `  ${i + 1}. ${item.name} (${item.fileType}, ${item.fileSize})`)
  .join("\n")}

验收说明:
  - 所有设计文件已按要求完成
  - 源文件和导出文件均包含在内
  - 如有问题请在 7 个工作日内联系设计师

确认信息:
  确认人签名: ${deliveryRecord?.signature || "（待确认）"}
  确认时间: ${
    deliveryRecord
      ? formatDateTime(deliveryRecord.confirmedAt)
      : "（待确认）"
  }

生成时间: ${new Date().toLocaleString("zh-CN")}
`;
      docsFolder.file("验收单.txt", acceptanceContent);
      docsFolder.file("目录清单.txt", generateDirectoryListing());

      const receiptFolder = folder.folder("验收回执");
      if (!receiptFolder) throw new Error("无法创建验收回执文件夹");
      receiptFolder.file(`${project.title}-验收回执.pdf`, generateAcceptanceReceipt());

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
          deliveryItems.map((i) => i.id),
          deliveryItems.map((i) => i.fileName)
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

  const toggleHistoryItem = (id: string) => {
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
                <>
                  <button
                    onClick={downloadReceipt}
                    disabled={downloadingReceipt}
                    className="btn flex items-center gap-2 disabled:opacity-50"
                  >
                    {downloadingReceipt ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Receipt size={14} />
                        下载验收回执
                      </>
                    )}
                  </button>
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
                </>
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
                  <div className="grid grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-ink-50 mb-1">确认人</p>
                      <p className="text-ink-300 font-mono">
                        {deliveryRecord?.signature}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-50 mb-1">确认身份</p>
                      <p className="text-ink-300">
                        {deliveryRecord?.confirmedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-50 mb-1">交付时间</p>
                      <p className="text-ink-300 font-mono">
                        {deliveryRecord &&
                          formatDateTime(deliveryRecord.confirmedAt)}
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
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {deliveryRecord.downloadRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-paper-100 rounded-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleHistoryItem(record.id)}
                      className="w-full flex items-center justify-between p-3 bg-paper-50 hover:bg-paper-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedHistory.has(record.id) ? (
                          <ChevronDown size={14} className="text-ink-50" />
                        ) : (
                          <ChevronRight size={14} className="text-ink-50" />
                        )}
                        <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                          {record.type === "package" ? (
                            <Package size={14} className="text-brand-orange" />
                          ) : (
                            <File size={14} className="text-brand-orange" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-ink-300">
                            {record.type === "package"
                              ? "完整交付包"
                              : "单个文件下载"}
                          </p>
                          <p className="text-xs text-ink-50 font-mono">
                            {record.itemIds.length} 个文件 ·{" "}
                            {formatDateTime(record.downloadedAt)}
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
                          <span className="text-ink-50 ml-1">
                            (
                            {record.downloadedBy.role === "designer"
                              ? "设计师"
                              : "客户"}
                            )
                          </span>
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedHistory.has(record.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 border-t border-paper-100 bg-white">
                            <p className="text-xs text-ink-50 mb-2 font-mono">
                              包含文件:
                            </p>
                            <div className="space-y-1">
                              {record.itemNames.map((name, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 px-2 py-1 text-sm"
                                >
                                  <FileCode
                                    size={12}
                                    className="text-ink-50 flex-shrink-0"
                                  />
                                  <span className="text-ink-300 truncate">
                                    {name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                      {downloadProgress > 0
                        ? `打包中 ${downloadProgress}%`
                        : "下载中..."}
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
                  <p className="text-xs text-ink-50 mt-2 font-mono">
                    {downloadProgress < 70
                      ? "正在打包设计文件..."
                      : downloadProgress < 90
                        ? "正在生成文档..."
                        : "正在压缩交付包..."}
                  </p>
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
                              <CheckCircle2
                                size={20}
                                className="text-brand-mint"
                              />
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
                              item.completed
                                ? "text-brand-mint"
                                : "text-ink-300"
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
                          <p className="text-sm text-ink-50">
                            {item.description}
                          </p>
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
                                <Loader2
                                  size={10}
                                  className="animate-spin"
                                />
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
                <div className="flex items-start gap-3">
                  <User size={16} className="text-ink-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-50">当前身份</p>
                    <p className="text-sm text-ink-300">
                      {currentUser.name}
                      <span className="text-ink-50 text-xs ml-1">
                        ({currentUser.role === "designer" ? "设计师" : "客户"})
                      </span>
                    </p>
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
                    onClick={downloadReceipt}
                    disabled={downloadingReceipt}
                    className="w-full btn flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingReceipt ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Receipt size={14} />
                        下载验收回执
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
              确认人：
              <span className="font-mono">{signature}</span>
              <span className="text-ink-50 text-xs block mt-1">
                身份：{currentUser.name} (
                {currentUser.role === "designer" ? "设计师" : "客户"})
              </span>
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
