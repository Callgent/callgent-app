import { Form, Input, Select, Switch, Collapse } from "antd";

export default function ProviderFields() {
  return (
    <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 mb-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        新建 Provider
      </h3>

      <Form.Item
        label="名称"
        name={["provider", "name"]}
        rules={[{ required: true, message: "请输入 Provider 名称" }]}
      >
        <Input placeholder="例如: OpenAI Platform" />
      </Form.Item>

      <Form.Item label="描述" name={["provider", "desc"]}>
        <Input.TextArea rows={2} placeholder="描述此 Provider 的用途..." />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label="验证方法"
          name={["provider", "method"]}
          initialValue="GET"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="验证 URL"
          name={["provider", "validUrl"]}
          rules={[
            { required: true, message: "请输入验证 URL" },
            { type: "url", message: "请输入有效的 URL" },
          ]}
        >
          <Input
            placeholder="https://api.example.com/v1/verify"
            className="font-mono text-sm"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label="策略"
          name={["provider", "strategy"]}
          initialValue="STATIC"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="STATIC">STATIC</Select.Option>
            <Select.Option value="DYNAMIC">DYNAMIC</Select.Option>
            <Select.Option value="REFRESHABLE">REFRESHABLE</Select.Option>
            <Select.Option value="ROTATING">ROTATING</Select.Option>
            <Select.Option value="CUSTOM">CUSTOM</Select.Option>
            <Select.Option value="NONE">NONE</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Token 格式"
          name={["provider", "config", "tokenFormat"]}
          initialValue="apiKey"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="apiKey">API Key</Select.Option>
            <Select.Option value="jwt">JWT</Select.Option>
            <Select.Option value="basic">Basic</Select.Option>
            <Select.Option value="oauth2">OAuth2</Select.Option>
          </Select>
        </Form.Item>
      </div>

      {/* Config Section */}
      <Collapse
        ghost
        className="mb-4 -mx-2"
        items={[
          {
            key: "config",
            label: <span className="text-sm font-medium">高级配置</span>,
            children: (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Token 位置"
                    name={["provider", "config", "location"]}
                    initialValue="headers"
                  >
                    <Select>
                      <Select.Option value="headers">Headers</Select.Option>
                      <Select.Option value="query">Query</Select.Option>
                      <Select.Option value="body">Body</Select.Option>
                      <Select.Option value="cookie">Cookie</Select.Option>
                      <Select.Option value="cert">Cert</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Key 名称"
                    name={["provider", "config", "key"]}
                    initialValue="Authorization"
                  >
                    <Input
                      placeholder="Authorization"
                      className="font-mono text-sm"
                    />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="前缀"
                    name={["provider", "config", "prefix"]}
                    initialValue="Bearer "
                  >
                    <Input
                      placeholder="Bearer "
                      className="font-mono text-sm"
                    />
                  </Form.Item>

                  <Form.Item
                    label="后缀"
                    name={["provider", "config", "postfix"]}
                  >
                    <Input placeholder="" className="font-mono text-sm" />
                  </Form.Item>
                </div>

                <Form.Item
                  label="算法"
                  name={["provider", "config", "algorithm"]}
                >
                  <Input
                    placeholder="例如: HS256"
                    className="font-mono text-sm"
                  />
                </Form.Item>

                <Form.Item
                  label="UID 提取表达式"
                  name={["provider", "config", "uidPel"]}
                >
                  <Input
                    placeholder="例如: $.data.user.id"
                    className="font-mono text-sm"
                  />
                </Form.Item>
              </div>
            ),
          },
        ]}
      />

      <div className="flex gap-8">
        <Form.Item
          label="启用"
          name={["provider", "enabled"]}
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="共享范围"
          name={["provider", "shared"]}
          initialValue={false}
        >
          <Select style={{ width: 120 }}>
            <Select.Option value={false}>私有</Select.Option>
            <Select.Option value={null}>租户内</Select.Option>
            <Select.Option value={true}>全局</Select.Option>
          </Select>
        </Form.Item>
      </div>
    </div>
  );
}
