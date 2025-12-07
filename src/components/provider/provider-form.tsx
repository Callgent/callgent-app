import { useEffect, useState } from "react";
import { Form, Input, Select, Switch, Button, message, Collapse } from "antd";
import { ArrowLeft, Check, Key, Play, Loader2 } from "lucide-react";
import { useProviderStore } from "@/store/provider";
import { testProviderApi } from "@/api/realm";
import type { ProviderItem, ProviderFormValues } from "@/types/provider";
import { useRouter } from "@/router/hooks";

interface ProviderFormProps {
  provider?: ProviderItem | null;
  isEdit?: boolean;
  onClose?: () => void;
}

export default function ProviderForm({
  provider,
  isEdit = false,
  onClose,
}: ProviderFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<ProviderFormValues>();
  const { loading, createProvider, updateProvider } = useProviderStore();

  const [testToken, setTestToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    uid?: string;
    error?: string;
  } | null>(null);

  // 初始化 provider 值
  useEffect(() => {
    if (provider) {
      form.setFieldsValue({
        name: provider.name,
        desc: provider.desc,
        shared: provider.shared,
        enabled: provider.enabled,
        method: provider.method ?? "GET",
        validUrl: provider.validUrl,
        strategy: provider.strategy,
        config: provider.config,
      });
    }
  }, [provider, form]);

  // 测试 provider API
  const handleTestProvider = async () => {
    if (!testToken.trim()) return message.warning("请输入测试 Token");

    const values = form.getFieldsValue();
    if (!values.validUrl) return message.warning("请先填写验证 URL");

    setTesting(true);
    setTestResult(null);

    try {
      const res = await testProviderApi({
        validUrl: values.validUrl,
        method: values.method,
        strategy: values.strategy,
        token: testToken,
        config: {
          location: values.config?.location,
          key: values.config?.key,
          prefix: values.config?.prefix,
          postfix: values.config?.postfix,
          uidJsonPath: values.config?.uidJsonPath,
        },
      });

      if (res.data?.success) {
        setTestResult({ success: true, uid: res.data.uid });
        message.success("测试成功");
      } else {
        setTestResult({ success: false, error: res.message || "测试失败" });
      }
    } catch (e: any) {
      setTestResult({ success: false, error: e.message || "请求失败" });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit && provider) {
        await updateProvider(provider.id, values);
        message.success("更新成功");
      } else {
        await createProvider(values);
        message.success("创建成功");
      }

      onClose ? onClose() : router.push("/callgent/provider");
    } catch {
      message.error(isEdit ? "更新失败" : "创建失败");
    }
  };

  const handleBack = () => {
    onClose ? onClose() : router.push("/callgent/provider");
  };

  return (
    <main className="w-full bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <Key className="w-5 h-5 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEdit ? "编辑 Provider" : "新建 Provider"}
                </h1>

                <p className="text-sm text-gray-500">
                  {isEdit && provider ? `ID: ${provider.id}` : "配置认证提供者"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              shared: false,
              enabled: true,
              method: "GET",
              strategy: "STATIC",
              config: {
                location: "headers",
                key: "Authorization",
                prefix: "Bearer ",
                postfix: "",
                tokenFormat: "apiKey",
                algorithm: "",
                algorithmParams: {},
                uidJsonPath: "",
              },
            }}
            className="p-6"
          >
            <div className="space-y-6">
              {/* 信息提示 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      配置认证提供者
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Provider 定义 Token 的验证方式，包括验证 URL、策略与 Token
                      配置
                    </p>
                  </div>
                </div>
              </div>

              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: "请输入名称" }]}
              >
                <Input placeholder="Provider 名称" size="large" />
              </Form.Item>

              <Form.Item label="描述" name="desc">
                <Input.TextArea
                  placeholder="描述此 Provider 的用途"
                  size="large"
                />
              </Form.Item>

              <div className="flex gap-4 w-full">
                <Form.Item
                  label="验证方法"
                  name="method"
                  className="mb-0"
                  style={{ width: 120 }}
                >
                  <Select>
                    <Select.Option value="GET">GET</Select.Option>
                    <Select.Option value="POST">POST</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="验证 URL"
                  name="validUrl"
                  rules={[
                    { required: true, message: "请输入验证 URL" },
                    { type: "url", message: "请输入有效 URL" },
                  ]}
                  className="flex-1 mb-0"
                >
                  <Input
                    placeholder="https://example.com/validate"
                    className="font-mono"
                    size="large"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="策略"
                  name="strategy"
                  rules={[{ required: true, message: "请选择策略" }]}
                >
                  <Select size="large">
                    <Select.Option value="STATIC">STATIC</Select.Option>
                    <Select.Option value="DYNAMIC">DYNAMIC</Select.Option>
                    <Select.Option value="REFRESHABLE">
                      REFRESHABLE
                    </Select.Option>
                    <Select.Option value="ROTATING">ROTATING</Select.Option>
                    <Select.Option value="CUSTOM">CUSTOM</Select.Option>
                    <Select.Option value="NONE">NONE</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Token 格式" name={["config", "tokenFormat"]}>
                  <Select size="large">
                    <Select.Option value="apiKey">API Key</Select.Option>
                    <Select.Option value="jwt">JWT</Select.Option>
                    <Select.Option value="basic">Basic</Select.Option>
                    <Select.Option value="oauth2">OAuth2</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <Collapse
                ghost
                className="!bg-gray-50 dark:!bg-gray-900 !rounded-lg !border !border-gray-200 dark:!border-gray-800"
                items={[
                  {
                    key: "advanced",
                    label: (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        高级配置
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            label="Token 位置"
                            name={["config", "location"]}
                          >
                            <Select>
                              <Select.Option value="headers">
                                Headers
                              </Select.Option>
                              <Select.Option value="query">Query</Select.Option>
                              <Select.Option value="body">Body</Select.Option>
                              <Select.Option value="cookie">
                                Cookie
                              </Select.Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            label="Token Key Name"
                            name={["config", "key"]}
                          >
                            <Input
                              placeholder="Authorization"
                              className="font-mono"
                            />
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item label="前缀" name={["config", "prefix"]}>
                            <Input
                              placeholder="Bearer "
                              className="font-mono"
                            />
                          </Form.Item>

                          <Form.Item label="后缀" name={["config", "postfix"]}>
                            <Input className="font-mono" />
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            label="算法"
                            name={["config", "algorithm"]}
                          >
                            <Input placeholder="HS256" className="font-mono" />
                          </Form.Item>

                          <Form.Item
                            label="UID JSONPath"
                            name={["config", "uidJsonPath"]}
                          >
                            <Input
                              placeholder="$.data.user.id"
                              className="font-mono"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">启用状态</span>
                    <Form.Item
                      name="enabled"
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch size="small" />
                    </Form.Item>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">共享范围</span>
                    <Form.Item name="shared" className="mb-0">
                      <Select size="small" style={{ width: 110 }}>
                        <Select.Option value={false}>私有</Select.Option>
                        <Select.Option value={null}>租户内</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium mb-2">测试配置</p>

                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="输入测试 Token，如 sk-xxxx"
                    value={testToken}
                    onChange={(e) => setTestToken(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={handleTestProvider} loading={testing}>
                    {testing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    测试
                  </Button>
                </div>

                <div
                  className={`p-3 rounded-lg min-h-[50px] ${
                    testResult
                      ? testResult.success
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
                        : "bg-red-50 dark:bg-red-900/20 border border-red-200"
                      : "bg-white dark:bg-black border border-gray-200"
                  }`}
                >
                  {testResult ? (
                    testResult.success ? (
                      <p className="text-green-700 dark:text-green-400">
                        ✓ 测试成功 UID: {testResult.uid}
                      </p>
                    ) : (
                      <p className="text-red-700 dark:text-red-400">
                        ✗ {testResult.error}
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-gray-400">测试结果显示在这里</p>
                  )}
                </div>
              </div>
            </div>
          </Form>

          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <Button type="text" onClick={handleBack}>
              取消
            </Button>

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={<Check className="w-4 h-4" />}
              className="!bg-black dark:!bg-white !text-white dark:!text-black !border-0"
            >
              {isEdit ? "保存" : "创建"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
