import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Space } from "antd";
import { getEndpointApi } from "@/api/services/callgentService";
import SwaggerApi from "@/components/callgent-tree/sep-api/callgent-api";
import { callgentApi } from "@/utils/callgent-tree";
import { CircleLoading } from "@/components/layouts/loading";
import { useRouter } from "@/router/hooks";

export default function CallgentApi() {
  const location = useLocation();
  const { push } = useRouter()
  const [openApi, setOpenApi] = useState<any>({});

  const init = async () => {
    const queryParams = new URLSearchParams(location.search);
    const endpointsId = queryParams.get("endpointsId");
    try {
      if (!endpointsId) {
        const data = {
          openapi: "3.0.0",
          paths: {}
        }
        setOpenApi(data);
      } else {
        const { data } = await getEndpointApi(endpointsId);
        const normalizedOpenApi = callgentApi(data);
        setOpenApi(normalizedOpenApi);
      }
    } catch (error) {
      console.error("Failed to load API data:", error);
      push("/callgent/callgents", { replace: false });
    }
  };

  useEffect(() => {
    init();
  }, [location.search]);

  return (
    <Space direction="vertical" size="large" className="w-full h-screen">
      {openApi?.paths ? <SwaggerApi openApi={openApi} /> : <CircleLoading />}
    </Space>
  );
}