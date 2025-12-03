/** Realm Manager container */
"use client";

import { useEffect, useState } from "react";
import { useAuthRealmStore } from "@/store/authRealmStore";
import RealmList from "./RealmList";
import RealmDetail from "./RealmDetail";

export default function RealmManager() {
  const { fetchRealms, fetchProviders, selectedRealm } = useAuthRealmStore();
  const [view, setView] = useState<"list" | "detail">("list");

  /** init load */
  useEffect(() => {
    fetchRealms();
    fetchProviders();
  }, []);

  /** when select realm → enter detail */
  useEffect(() => {
    if (selectedRealm) setView("detail");
  }, [selectedRealm]);

  return (
    <div className="dark:bg-black bg-gray-50 transition-all">
      {view === "list" ? (
        <RealmList />
      ) : (
        <RealmDetail goBack={() => setView("list")} />
      )}
    </div>
  );
}
