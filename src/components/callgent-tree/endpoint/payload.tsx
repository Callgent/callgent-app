import { Icon } from "@iconify/react";
import { Button, Form, Input, Modal, Select } from "antd";
import { useEndpointStore } from "@/store/endpoint";
import EditableTree from "../schema/EditableTree";
import { convertOpenApiToTree, requestMethods } from "../schema/utils";
import AIGenerated from "../schema/ai-generated";

export default function Payload() {
  const {
    status,
    setIsEndpointOpen,
    isEndpointOpen,
    information,
    setInformation,
    parameters,
    setParameters,
    requestBody,
    setRequestBody,
    responses,
    setResponses,
  } = useEndpointStore();

  const [formEndpoint] = Form.useForm();
  const handleChildData = (data: any) => {
    const { parameters = [], requestBody = {}, responses = {} } = data;
    setParameters(convertOpenApiToTree(parameters, "parameters"));
    setRequestBody(convertOpenApiToTree(requestBody, "requestBody"));
    setResponses(convertOpenApiToTree(responses, "responses"));
  };
  return (
    <>
      <div className="flex items-center space-x-2">
        <Input
          value={information?.endpointName}
          onChange={(e) => setInformation({ endpointName: e.target.value })}
          placeholder="Please enter endpoint name starting with /"
        />
        <button
          onClick={() => setIsEndpointOpen(true)}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
        >
          <Icon icon="solar:settings-bold" className="w-5 h-5 " />
        </button>
      </div>
      <div className="my-2">
        <label className="block font-medium mb-2">whatFor</label>
        <div className="border rounded">
          <Input.TextArea
            value={information?.whatFor}
            onChange={(e) => setInformation({ whatFor: e.target.value })}
            disabled={status === "read_only"}
            placeholder="Explain to caller, when and how to use this endpoint"
            style={{ resize: "none" }}
            className="border-none focus:ring-0 w-full p-2"
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
          <div className="flex justify-end p-2">
            <AIGenerated onDataReceived={handleChildData} />
          </div>
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">Parameters</div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600 p-1">
          <EditableTree
            mode={2}
            data={parameters}
            onChange={(data: any) => setParameters(data)}
            treeType="parameters"
            defaultExpandAll={false}
          />
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-600 rounded mt-2">
        <div className="font-medium bg-gray-50  px-4 py-2">RequestBody</div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600 p-1">
          <EditableTree
            mode={2}
            data={requestBody}
            onChange={(data: any) => setRequestBody(data)}
            treeType="requestBody"
            defaultExpandAll={false}
          />
        </div>
      </div>
      <div className="border border-gray-200  dark:border-gray-600 rounded mt-2">
        <div className="font-medium bg-gray-50 px-4 py-2">Responses</div>
        <div className="divide-y divide-gray-100 p-1">
          <EditableTree
            mode={2}
            data={responses}
            onChange={(data: any) => setResponses(data)}
            treeType="responses"
            defaultExpandAll={false}
          />
        </div>
      </div>
      <Modal
        title="Endpoint Settings"
        open={isEndpointOpen}
        onCancel={() => setIsEndpointOpen(false)}
        centered={true}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsEndpointOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              formEndpoint.validateFields().then((values) => {
                setInformation({ endpoint: values });
                setIsEndpointOpen(false);
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </Button>,
        ]}
      >
        <Form
          form={formEndpoint}
          layout="vertical"
          initialValues={information.endpoint}
        >
          <Form.Item
            name="method"
            label="HTTP Method"
            rules={[{ required: true }]}
          >
            <Select
              className="w-full"
              options={requestMethods.map((item) => ({
                value: item.value,
                label: (
                  <div className="flex justify-between items-center mr-4">
                    <span>{item.value} </span>
                    <span className="text-gray-600 text-sm">
                      {" "}
                      {item.description}{" "}
                    </span>
                  </div>
                ),
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
