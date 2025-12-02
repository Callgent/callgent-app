import { useEffect } from "react";
import { Spin } from "antd";
import { useRealmStore } from "@/store/realm";
import RealmForm from "@/components/realm/realm-form";
import { useParams } from "react-router";

export default function RealmEditPage() {
  const { id } = useParams();
  const { currentRealm, loading, fetchRealmById } = useRealmStore();

  useEffect(() => {
    if (id) {
      fetchRealmById(id);
    }
  }, [id, fetchRealmById]);

  if (loading && !currentRealm) {
    return (
      <main className="w-full bg-white dark:bg-black flex items-center justify-center">
        <Spin size="large" />
      </main>
    );
  }

  return <RealmForm realm={currentRealm} isEdit />;
}
