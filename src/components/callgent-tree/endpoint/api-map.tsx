import { Mentions } from "antd";
import SchemaEditor from "../SchemaTree/schema-editor";
import { useEndpointStore } from "@/models/endpoint";
import EditableTree from "../schema/EditableTree";
import { useState } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

export default function ApiMap() {
  const {
    information,
    parameters,
    requestBody,
    responses,
    parameters2,
    requestBody2,
    responses2,
    setInformation,
    setResponses,
    setParameters2,
    setRequestBody2,
  } = useEndpointStore();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="space-y-4 mt-2 overflow-x-hidden border p-2 rounded">
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api1
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600 p-1">
          <EditableTree
            mode={1}
            data={parameters}
            treeType="parameters"
            defaultExpandAll={false}
          />
          <EditableTree
            mode={1}
            data={requestBody}
            treeType="requestBody"
            defaultExpandAll={false}
          />
        </div>
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api2
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600 p-1">
          <EditableTree
            mode={3}
            data={parameters2}
            onChange={(data: any) => setParameters2(data)}
            treeType="parameters"
            defaultExpandAll={false}
          />
          <EditableTree
            mode={3}
            data={requestBody2}
            onChange={(data: any) => setRequestBody2(data)}
            treeType="requestBody"
            defaultExpandAll={false}
          />
        </div>
      </div>
      <div className="border border-gray-200  dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50 px-4 py-2 bg-dark-green">
          Responses comes from api2
        </div>
        <div className="divide-y divide-gray-100 p-1">
          <EditableTree
            mode={1}
            data={responses2}
            treeType="responses"
            defaultExpandAll={false}
          />
        </div>
        <div className="font-medium bg-gray-50 px-4 py-2 bg-dark-green">
          Responses comes from api1
        </div>
        <div className="divide-y divide-gray-100 p-1">
          <div className="flex flex-1 items-center space-x-2 justify-between cursor-pointer ">
            <span className="pl-8">StatusCode</span>
            <input
              type="text"
              value={information?.statusCode}
              onChange={(e) => setInformation({ statusCode: e.target.value })}
              className="border-b px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-0 hover:bg-gray-100 hover:border-green-500 cursor-pointer  overflow-hidden whitespace-nowrap text-ellipsis focus:border-green-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div
            className="flex flex-1 items-center space-x-2 justify-between cursor-pointer "
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <DownOutlined /> : <RightOutlined />}
            </button>
            <span>Responses</span>
            <input
              type="text"
              value={information?.responses_default}
              onChange={(e) =>
                setInformation({ responses_default: e.target.value })
              }
              className="border-b px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-0 hover:bg-gray-100 hover:border-green-500 cursor-pointer  overflow-hidden whitespace-nowrap text-ellipsis focus:border-green-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {isExpanded && (
            <div className="p-3 border-t">
              <EditableTree
                mode={3}
                data={responses}
                onChange={(data: any) => setResponses(data)}
                treeType="responses"
                defaultExpandAll={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
