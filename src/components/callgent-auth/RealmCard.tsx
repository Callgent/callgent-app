/** Realm card */
import { useAuthRealmStore } from "@/store/authRealmStore";
import RealmIcon from "./RealmIcon";
import Badge from "./Badge";
import { Calendar } from "lucide-react";

export default function RealmCard({ realm }) {
  const { providers, selectRealm } = useAuthRealmStore();
  const provider = providers.find((p) => p.id === realm.providerId);

  return (
    <div
      className="p-5 border rounded-lg dark:bg-[#0A0A0A] cursor-pointer"
      onClick={() => selectRealm(realm)}
    >
      <div className="flex justify-between mb-2">
        <div className="flex gap-3">
          <RealmIcon shared={realm.shared} />
          <div>
            <h3 className="font-semibold">{realm.name}</h3>
            <p className="text-xs text-gray-500">{realm.id}</p>
          </div>
        </div>
        <Badge enabled={realm.enabled} />
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{realm.desc}</p>

      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Calendar size={12} />
        更新于 {new Date(realm.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
