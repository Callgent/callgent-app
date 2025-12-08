import { useEffect } from "react";
import { message, Spin } from "antd";
import { useProviderStore } from "@/store/provider";
import ProviderForm from "@/components/provider/provider-form";
import { ArrowLeft, Key } from "lucide-react";
import { useRouter } from "@/router/hooks";
import { ProviderFormValues } from "@/types/realm";

// Provider 表单页面
export default function ProviderFormPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const providerId = searchParams.get("id");
  const isEdit = !!providerId;

  const { currentProvider, loading, fetchProviderById } = useProviderStore();

  useEffect(() => {
    if (isEdit && providerId) {
      fetchProviderById(Number(providerId));
    }
  }, [providerId, isEdit]);

  // if (isEdit && loading && !currentProvider) {
  //   return (
  //     <main className="w-full bg-white dark:bg-black flex items-center justify-center">
  //       <Spin size="large" />
  //     </main>
  //   );
  // }
  const router = useRouter();
  const handleBack = () => {
    router.push("/callgent/provider");
  };

  const { createProvider, updateProvider } = useProviderStore();
  const handleSubmit = async (values: ProviderFormValues) => {
    const provider = currentProvider;
    try {
      if (isEdit && provider) {
        await updateProvider(provider.id, values);
        message.success("更新成功");
      } else {
        await createProvider(values);
        message.success("创建成功");
      }
    } catch {
      message.error(isEdit ? "更新失败" : "创建失败");
    }
  };
  return (
    <main className="w-full bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <Key className="w-5 h-5 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEdit ? "编辑 Provider" : "新建 Provider"}
                </h1>

                <p className="text-sm text-gray-500">配置认证提供者</p>
              </div>
            </div>
          </div>
        </div>
        <ProviderForm
          provider={isEdit ? currentProvider : null}
          isEdit={isEdit}
          handleSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
