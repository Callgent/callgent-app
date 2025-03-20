import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Tabs, Spin } from "antd";
import { getCallgentTree } from "@/api/services/callgentService";
import NewAuth from "@/components/callgent-tree/model/create-auth";
import { Realm } from "#/entity";
import Card from "@/components/card";
import useTreeActionStore, { useTreeActions } from "@/models/callgentTreeStore";

export default function CallgentAuth() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const { id, realmKey = "new", nodeId } = Object.fromEntries(params.entries());
  const [activeKey, setActiveKey] = useState<string>(realmKey);
  const [loading, setLoading] = useState<boolean>(false);
  const { realms } = useTreeActionStore();
  const { setCallgentRealms } = useTreeActions();
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
      setActiveKey(newRealms[0]?.realmKey || "new");
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
      key: item.realmKey,
      label: item.realm,
      children: <NewAuth initialData={item} callgentId={id!} realmKey={realmKey} selectId={nodeId} />,
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
          activeKey={activeKey}
          onChange={setActiveKey}
          hideAdd={true}
        />
      )}
    </Card>
  );
}