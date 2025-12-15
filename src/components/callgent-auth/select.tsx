import { useState, useEffect, useRef } from "react";
import { Modal, Select, Spin, Button } from "antd";
import { Key, Plus } from "lucide-react";
import { useRealmStore } from "@/store/realm";
import { LockIcon, UnlockIcon } from "../icon/icon-tree";
import { useRouter } from "@/router/hooks";
import { bindRealmApi, unbindRealmApi } from "@/api/realm";
import { CallgentInfo } from "@/types/entity";

export default function SelectRealmPage({ node }: { node: CallgentInfo }) {
  const router = useRouter();
  const { realms, loading, fetchRealms } = useRealmStore();

  const [selectedRealms, setSelectedRealms] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  /** 打开 Modal 时加载 realm 列表并回显 node 的已有绑定 */
  useEffect(() => {
    if (modalOpen) {
      fetchRealms({ enabled: "enabled" });
      const ids =
        node?.securities?.map((s: { realmId: string }) => s.realmId) ?? [];
      setSelectedRealms(ids);
    }
  }, [modalOpen]);

  /** 搜索 */
  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRealms({ search: value, enabled: "enabled" });
    }, 300);
  };

  /** 提交绑定（注意：你需要改造 bindRealmApi 支持多选数组） */
  const handleConfirm = async () => {
    try {
      await bindRealmApi(
        selectedRealms.map((i) => ({ realmId: i })),
        node.id!,
        node.level!
      ); // <-- 发送数组
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  /** 清空绑定 */
  const handleUnbind = async () => {
    try {
      await bindRealmApi([], node.id!, node.level!);
      setSelectedRealms([]);
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
          node?.securities?.length
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
            <span className="font-semibold text-base">绑定安全域</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={480}
        footer={
          <div className="flex items-center justify-between pt-2">
            <Button
              type="text"
              danger
              onClick={handleUnbind}
              disabled={!selectedRealms.length}
            >
              解除全部绑定
            </Button>

            <div className="flex gap-2">
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button
                type="primary"
                disabled={!selectedRealms.length}
                onClick={handleConfirm}
                className="bg-black dark:bg-white text-white dark:text-black"
              >
                确认绑定
              </Button>
            </div>
          </div>
        }
      >
        {/** 上半部分：选择区 + 新增按钮 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              选择安全域
            </label>

            <Select
              mode="multiple"
              placeholder="搜索或选择 Realm..."
              value={selectedRealms}
              onChange={setSelectedRealms}
              loading={loading}
              showSearch
              filterOption={false}
              onSearch={handleSearch}
              options={realms.map((r) => ({ value: r.id, label: r.name }))}
              className="w-full"
              size="large"
              notFoundContent={
                loading ? <Spin size="small" /> : "暂无可用 Realm"
              }
            />
          </div>

          <Button
            type="default"
            icon={<Plus size={16} />}
            onClick={() => router.push("/callgent/realm/form")}
            className="ml-3 mt-7"
          >
            新增
          </Button>
        </div>

        {/** 中部：状态显示 */}
        <div className="py-3 px-3 rounded-md bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            已绑定：
            <span className="font-semibold text-gray-800 dark:text-gray-200 ml-1">
              {selectedRealms.length}
            </span>
            个 Realm
          </div>
        </div>
      </Modal>
    </div>
  );
}
