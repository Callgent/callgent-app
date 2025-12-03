import { Key, Link, Calendar, Trash2, Shield } from "lucide-react";
import type { ProviderItem } from "@/types/provider";

interface ProviderCardProps {
  item: ProviderItem;
  onClick: () => void;
  onDelete: (id: number) => void;
}

// Provider 卡片组件
export default function ProviderCard({
  item,
  onClick,
  onDelete,
}: ProviderCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  // 共享范围标签
  const getShareLabel = () => {
    if (item.shared === true) return "全局";
    if (item.shared === null) return "租户";
    return "私有";
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute bottom-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </h3>
            <p className="text-sm font-mono text-gray-500">{item.strategy}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            item.enabled
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              item.enabled ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          {item.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {item.desc || "No description"}
      </p>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">URL</span>
        </div>
        <span className="text-gray-900 dark:text-white truncate max-w-[200px] font-mono text-xs">
          {item.validUrl || "-"}
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm mt-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Scope</span>
        </div>
        <span className="text-gray-900 dark:text-white">{getShareLabel()}</span>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        <span>更新于 {formatDate(item.updatedAt)}</span>
      </div>
    </div>
  );
}
