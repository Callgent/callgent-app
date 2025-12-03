/** Realm list view */
import { useState } from "react";
import { useAuthRealmStore } from "@/store/authRealmStore";
import RealmCard from "./RealmCard";
import { Search } from "lucide-react";

export default function RealmList() {
  const { realms } = useAuthRealmStore();
  const [search, setSearch] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Realms</h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          className="w-full pl-10 py-2 rounded bg-white dark:bg-black border"
          placeholder="搜索 Realm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {realms
          .filter((r) => r.name.includes(search) || r.id.includes(search))
          .map((realm) => (
            <RealmCard key={realm.pk} realm={realm} />
          ))}
      </div>
    </div>
  );
}
