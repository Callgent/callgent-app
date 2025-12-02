import { useEffect, useState, useCallback, useRef } from "react";
import { Button, Spin, Empty, Input, Segmented, Modal, message } from "antd";
import { Plus, Moon, Sun, Search } from "lucide-react";
import { useRealmStore } from "@/store/realm";
import RealmCard from "@/components/realm/realm-card";
import { useNavigate } from "react-router";
import { useRouter } from "@/router/hooks";

type FilterType = "all" | "enabled" | "disabled";

export default function RealmPage() {
  const navigate = useNavigate();
  const { realms, loading, fetchRealms, deleteRealm } = useRealmStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isDark, setIsDark] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();

  const loadRealms = useCallback(
    (searchValue: string, filterValue: FilterType) => {
      fetchRealms({
        search: searchValue || undefined,
        enabled: filterValue,
      });
    },
    [fetchRealms]
  );

  useEffect(() => {
    loadRealms("", "all");
  }, [loadRealms]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      loadRealms(value, filter);
    }, 300);
  };

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    loadRealms(search, value);
  };

  const handleCardClick = (realmId: string) => {
    router.push(`/callgent/realms/${realmId}/edit`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确定删除此 Realm？",
      content: "此操作不可撤销",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteRealm(id);
          message.success("删除成功");
          loadRealms(search, filter);
        } catch {
          message.error("删除失败");
        }
      },
    });
  };

  return (
    <main className="w-full bg-white dark:bg-black px-4 sm:px-6 lg:px-8 pt-8 pb-20 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Realms
              </h1>
              <p className="text-sm text-gray-500">
                管理您的认证领域、权限范围及安全配置。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate("/callgent/realms-new")}
              className="flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              新建 Realm
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : realms.length === 0 ? (
          <Empty description="暂无数据" className="py-20" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realms.map((item) => (
              <RealmCard
                key={item.pk}
                item={item}
                onClick={() => handleCardClick(item.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
