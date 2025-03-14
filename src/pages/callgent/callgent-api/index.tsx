import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Space } from "antd";
import { getCallgentApi } from "@/api/services/callgentService";
import SwaggerApi from "@/components/callgent-tree/callgent-api";
import { callgentApi } from "@/utils/callgent-tree";
import { CircleLoading } from "@/components/loading";

export default function CallgentApi() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openApi, setOpenApi] = useState<any>({});

  const init = async () => {
    const queryParams = new URLSearchParams(location.search);
    const endpointsId = queryParams.get("endpointsId");
    try {
      if (!endpointsId) {
        const data = {
          openapi: "3.0.0",
          name: "callgent",
          info: {
            "title": "CallgentApi",
          },
          paths: {}
        }
        setOpenApi(data);
      } else {
        const { data } = await getCallgentApi(endpointsId);
        const normalizedOpenApi = callgentApi(data);
        setOpenApi(normalizedOpenApi);
      }
    } catch (error) {
      console.error("Failed to load API data:", error);
      navigate("/callgent/callgents", { replace: true });
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