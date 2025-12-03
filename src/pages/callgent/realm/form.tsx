import { useEffect } from "react";
import { Spin } from "antd";
import { useRealmStore } from "@/store/realm";
import RealmForm from "@/components/realm/realm-form";

export default function RealmFormPage() {
  // 从 URL 获取 id 参数，有则编辑，无则新增
  const searchParams = new URLSearchParams(window.location.search);
  const realmId = searchParams.get("id");
  const isEdit = !!realmId;

  const { currentRealm, loading, fetchRealmById, fetchProviders } =
    useRealmStore();

  // 编辑模式下加载数据
  useEffect(() => {
    if (isEdit && realmId) {
      fetchRealmById(realmId);
    }
  }, [realmId, isEdit, fetchRealmById]);
  useEffect(() => {
    fetchProviders();
  }, []);
  if (isEdit && loading && !currentRealm) {
    return (
      <main className="w-full bg-white dark:bg-black flex items-center justify-center">
        <Spin size="large" />
      </main>
    );
  }

  return <RealmForm realm={isEdit ? currentRealm : null} isEdit={isEdit} />;
}
