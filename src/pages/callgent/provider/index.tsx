import { useEffect, useState, useRef } from "react";
import { Button, Spin, Empty, Input, Segmented, Modal, message } from "antd";
import { Plus, Moon, Sun, Search, Key } from "lucide-react";
import { useProviderStore } from "@/store/provider";
import ProviderCard from "@/components/provider/provider-card";
import { useRouter } from "@/router/hooks";

type FilterType = "all" | "enabled" | "disabled";

export default function ProviderPage() {
  const { providers, loading, fetchProviders, deleteProvider } =
    useProviderStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isDark, setIsDark] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();

  // 加载列表
  const init = async (searchValue?: string, filterValue?: FilterType) => {
    fetchProviders({
      search: searchValue || undefined,
      enabled: filterValue,
    });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // 搜索（防抖）
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      init(value, filter);
    }, 300);
  };

  // 切换过滤
  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    init(search, value);
  };

  // 点击卡片
  const handleCardClick = (id: number) => {
    router.push(`/callgent/provider/form?id=${id}`);
  };

  // 删除
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "确定删除此 Provider？",
      content: "此操作不可撤销",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteProvider(id);
          message.success("删除成功");
          init(search, filter);
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
            <div className="w-10 h-10 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <Key className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Providers
              </h1>
              <p className="text-sm text-gray-500">
                管理认证提供者配置，定义 Token 验证策略。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={
                isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )
              }
              onClick={() => setIsDark(!isDark)}
              className="flex items-center justify-center"
            />
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push("/callgent/provider/form")}
              className="flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              新建 Provider
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <Input
            placeholder="搜索 Provider..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-md"
            allowClear
          />
          <Segmented
            value={filter}
            onChange={(v) => handleFilterChange(v as FilterType)}
            options={[
              { label: "全部", value: "all" },
              { label: "Enabled", value: "enabled" },
              { label: "Disabled", value: "disabled" },
            ]}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : providers.length === 0 ? (
          <Empty description="暂无数据" className="py-20" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((item) => (
              <ProviderCard
                key={item.id}
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
