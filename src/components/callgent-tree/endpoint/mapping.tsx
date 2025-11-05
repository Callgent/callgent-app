import { useEffect, useRef } from "react";
import { Input, InputRef, Tabs } from "antd";
import { useEndpointStore } from "@/models/endpoint";
import EndpointSelectApi from "./select-api";

export default function Mapping() {
  const { setInformation, information } = useEndpointStore();
  const inputRef = useRef<InputRef>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Tabs
      size="small"
      items={[
        {
          key: "select",
          label: "Endpoint Select",
          children: (
            <div className="p-2">
              <EndpointSelectApi />
            </div>
          ),
        },
        {
          key: "manual",
          label: "How2Ops",
          children: (
            <div className="p-2">
              <div className="font-medium bg-gray-50 py-2">How2Ops</div>
              <Input.TextArea
                rows={3}
                disabled={status === "edit"}
                value={information?.how2Ops}
                className="w-full border border-gray-300  dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setInformation({ how2Ops: e.target.value })}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
