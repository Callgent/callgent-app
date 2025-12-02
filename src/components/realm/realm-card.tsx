import { Globe, Users, Calendar, Trash2 } from "lucide-react";
import type { RealmItem } from "@/types/realm";

interface RealmCardProps {
  item: RealmItem;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function RealmCard({ item, onClick, onDelete }: RealmCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md"
    >
      {/* Delete Button - 右下角，hover 显示 */}
      <button
        onClick={handleDelete}
        className="absolute bottom-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </h3>
            <p className="text-sm font-mono text-gray-500">{item.id}</p>
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
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Provider</span>
        </div>
        <span className="text-gray-900 dark:text-white truncate max-w-[160px]">
          {item.provider?.name || "-"}
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm mt-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Shared</span>
        </div>
        <span className="text-gray-900 dark:text-white">
          {item.shared === "global"
            ? "全局"
            : item.shared === "tenant"
            ? "租户内"
            : "私有"}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        <span>更新于 {formatDate(item.updatedAt)}</span>
      </div>
    </div>
  );
}
