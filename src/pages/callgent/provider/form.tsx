import { useEffect } from "react";
import { Spin } from "antd";
import { useProviderStore } from "@/store/provider";
import ProviderForm from "@/components/provider/provider-form";

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

  if (isEdit && loading && !currentProvider) {
    return (
      <main className="w-full bg-white dark:bg-black flex items-center justify-center">
        <Spin size="large" />
      </main>
    );
  }

  return (
    <ProviderForm provider={isEdit ? currentProvider : null} isEdit={isEdit} />
  );
}
