import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Tabs, Spin } from "antd";
import { getCallgentTree } from "@/api/services/callgentService";
import { Realm } from "#/entity";
import useTreeActionStore, { useTreeActions } from "@/models/callgentTreeStore";
import NewAuth from "@/components/callgent-tree/auth/create-auth";
import Card from "@/components/layouts/card";
import { getSearchParamsAsJson } from "@/utils";

export default function CallgentAuth() {
  const navigate = useNavigate();
  const { id } = getSearchParamsAsJson();
  const [loading, setLoading] = useState<boolean>(false);
  const { realms, realmKey } = useTreeActionStore();
  const { setCallgentRealms, setRealmKey } = useTreeActions();
  const redirectToCallgents = useCallback(() => {
    navigate("/callgent/callgents", { replace: true });
  }, [navigate]);

  const init = useCallback(async () => {
    if (!id) {
      redirectToCallgents();
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCallgentTree(id);
      const newRealms = data?.realms || [];
      setCallgentRealms(newRealms);
      setRealmKey(newRealms[0]?.id || "new");
    } catch (error) {
      redirectToCallgents();
    } finally {
      setLoading(false);
    }
  }, [id, redirectToCallgents]);

  useEffect(() => {
    init();
  }, [init]);

  const tabItems = [
    ...(realms.map((item: Realm) => ({
      key: item.id!,
      label: item?.provider,
      children: <NewAuth callgentId={id!} />,
      closable: false,
    }))),
    {
      key: "new",
      label: "apiKey +",
      children: <NewAuth callgentId={id!} />,
      closable: false,
    }
  ];

  return (
    <Card className="h-full flex-col rounded-2xl">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spin />
        </div>
      ) : (
        <Tabs
          className="w-full h-full overflow-auto"
          type="editable-card"
          items={tabItems}
          activeKey={realmKey}
          onChange={setRealmKey}
          hideAdd={true}
        />
      )}
    </Card>
  );
}