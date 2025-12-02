/** Realm detail view */
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { useAuthRealmStore } from "@/store/authRealmStore";
import Toggle from "./Toggle";
import ProviderSelect from "./ProviderSelect";
import { useState } from "react";

export default function RealmDetail({ goBack, isDark, setIsDark }) {
  const { selectedRealm } = useAuthRealmStore();

  const [form, setForm] = useState({ ...selectedRealm });

  /** update local form */
  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button className="flex items-center mb-6" onClick={goBack}>
        <ChevronLeft /> 返回列表
      </button>

      <h1 className="text-3xl font-bold mb-4">{form.name}</h1>

      {/* Basic settings */}
      <div className="border p-6 rounded-xl mb-6">
        <h2 className="font-semibold mb-3">基本设置</h2>

        <input
          className="w-full mb-4 p-2 border rounded"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <textarea
          className="w-full p-2 border rounded"
          value={form.desc}
          onChange={(e) => update("desc", e.target.value)}
        />

        <div className="flex gap-6 mt-4">
          <Toggle
            checked={form.enabled}
            onChange={(v) => update("enabled", v)}
            label="启用 Realm"
          />
          <Toggle
            checked={form.shared}
            onChange={(v) => update("shared", v)}
            label="Shared"
          />
        </div>
      </div>

      {/* Provider */}
      <ProviderSelect form={form} update={update} />

      {/* Action Bar */}
      <div className="flex justify-end mt-10 gap-3">
        <button className="px-4 py-2" onClick={goBack}>
          取消
        </button>
        <button className="px-6 py-2 bg-black text-white rounded flex items-center gap-2">
          <Save size={16} /> 保存
        </button>
      </div>
    </div>
  );
}
