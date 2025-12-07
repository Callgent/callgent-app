import { useState, useEffect, useRef } from "react";
import { Modal, Select, Spin, Button } from "antd";
import { Shield, Pencil, Key } from "lucide-react";
import { useRealmStore } from "@/store/realm";
import type { RealmItem } from "@/types/realm";
import { LockIcon, UnlockIcon } from "../icon/icon-tree";
import { useRouter } from "@/router/hooks";
import { bindRealmApi, unbindRealmApi } from "@/api/realm";
import { CallgentInfo } from "@/types/entity";

export default function SelectRealmPage({ node }: { node: CallgentInfo }) {
  const router = useRouter();
  const { realms, loading, fetchRealms } = useRealmStore();
  const [boundRealm, setBoundRealm] = useState<RealmItem | null>(null);
  const [tempSelected, setTempSelected] = useState<RealmItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (modalOpen) {
      fetchRealms({ enabled: "enabled" });
      setTempSelected(boundRealm);
    }
  }, [modalOpen]);

  const handleRealmChange = (id: string) => {
    const realm = realms.find((r) => r.id === id);
    if (realm) setTempSelected(realm);
  };

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRealms({ search: value, enabled: "enabled" });
    }, 300);
  };

  // 修改：绑定时调用 API
  const handleConfirm = async () => {
    if (!tempSelected) return;
    try {
      await bindRealmApi(tempSelected.id, node?.id!, node?.level!);
      setBoundRealm(tempSelected);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tempSelected) {
      router.push(`/callgent/realm/form?id=${tempSelected.id}`);
    }
  };

  // 修改：解除绑定时调用 API
  const handleUnbind = async () => {
    if (!boundRealm) return;

    try {
      await unbindRealmApi(node?.id!, node?.level!);
      setBoundRealm(null);
      setTempSelected(null);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
        title={
          node?.securities
            ? `已绑定: ${node?.securities.length}`
            : "点击绑定安全域"
        }
      >
        {node?.securities?.length ? LockIcon : UnlockIcon}
      </button>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-400" />
            <span>绑定安全域</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <div className="flex items-center justify-between">
            <Button
              type="text"
              danger
              onClick={handleUnbind}
              disabled={!boundRealm}
            >
              解除绑定
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button
                type="primary"
                onClick={handleConfirm}
                disabled={!tempSelected}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                确认绑定
              </Button>
            </div>
          </div>
        }
        width={480}
        destroyOnHidden
      >
        <div className="py-2">
          <div className="text-sm text-gray-500 mb-3">
            选择一个安全域来保护此 Callgent 的访问权限
          </div>

          <Select
            placeholder="搜索或选择 Realm..."
            value={tempSelected?.id}
            onChange={handleRealmChange}
            loading={loading}
            showSearch
            filterOption={false}
            onSearch={handleSearch}
            options={realms.map((r) => ({ value: r.id, label: r.name }))}
            className="w-full"
            size="large"
            notFoundContent={loading ? <Spin size="small" /> : "暂无可用 Realm"}
          />

          <div className="mt-4 min-h-[140px] p-4 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
            {tempSelected ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tempSelected.name}
                    </span>
                  </div>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="编辑此 Realm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {tempSelected.desc || "暂无描述"}
                </p>

                {tempSelected.provider && (
                  <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          认证提供商
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {tempSelected.provider.name}
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                        {tempSelected.provider.strategy}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <Shield className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-2" />
                <div className="text-sm text-gray-400">
                  从上方选择一个 Realm
                </div>
                <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                  绑定后将使用该安全域进行访问控制
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
