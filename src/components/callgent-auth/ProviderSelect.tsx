/** Provider selection & creation */
import { useAuthRealmStore } from "@/store/authRealmStore";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

export default function ProviderSelect({ form, update }) {
  const { providers } = useAuthRealmStore();
  const [isNew, setIsNew] = useState(false);

  /** handle provider dropdown */
  const handleChange = (e) => {
    const v = e.target.value;
    if (v === "new") {
      setIsNew(true);
      update("providerId", null);
    } else {
      setIsNew(false);
      update("providerId", Number(v));
    }
  };

  return (
    <div className="border p-6 rounded-xl">
      <h2 className="font-semibold mb-4">认证 Provider</h2>

      <div className="relative">
        <select
          className="w-full p-2 border rounded appearance-none"
          value={isNew ? "new" : form.providerId || ""}
          onChange={handleChange}
        >
          <option value="" disabled>
            请选择...
          </option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option disabled>────────────</option>
          <option value="new">+ 新建 Provider</option>
        </select>
        <ChevronDown className="absolute right-3 top-3 text-gray-400" />
      </div>

      {isNew && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-sm flex items-center gap-1 mb-3">
            <Plus size={14} /> 新 Provider
          </h3>

          {/* 你可以继续添加更多字段 */}
          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Provider 名称"
          />
        </div>
      )}
    </div>
  );
}
