import { useEffect, useState, useRef } from "react";
import { Form, Input, Select, Switch, Button, message, Collapse } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Shield,
  Key,
  Globe,
  Play,
  Loader2,
} from "lucide-react";
import { useRealmStore } from "@/store/realm";
import { testProviderApi } from "@/api/realm";
import type {
  RealmItem,
  ProviderFormValues,
  ShareType,
  ProviderItem,
} from "@/types/realm";
import { useNavigate } from "react-router";
import { useRouter } from "@/router/hooks";

const CREATE_NEW_PROVIDER = "__CREATE_NEW__";

interface FormValues {
  name: string;
  desc?: string;
  enabled: boolean;
  shared: ShareType;
  providerId?: number;
  provider?: ProviderFormValues;
}

interface RealmFormProps {
  realm?: RealmItem | null;
  isEdit?: boolean;
}

export default function RealmForm({ realm, isEdit = false }: RealmFormProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const {
    providers,
    loading,
    fetchProviders,
    createRealm,
    updateRealm,
    createProvider,
  } = useRealmStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(
    null
  );
  const [testToken, setTestToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    uid?: string;
    error?: string;
  } | null>(null);
  const router = useRouter();
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    if (realm) {
      form.setFieldsValue({
        name: realm.name,
        desc: realm.desc,
        providerId: realm.providerId,
        enabled: realm.enabled,
        shared: realm.shared ?? "private",
      });
      // 设置选中的 provider
      if (realm.provider) {
        setSelectedProvider(realm.provider);
      }
    }
  }, [realm, form]);

  // 当 providers 加载完成后，如果有 providerId，设置选中的 provider
  useEffect(() => {
    const providerId = form.getFieldValue("providerId");
    if (providerId && providers.length > 0) {
      const provider = providers.find((p) => p.id === providerId);
      if (provider) {
        setSelectedProvider(provider);
      }
    }
  }, [providers, form]);

  const handleProviderChange = (value: number | string) => {
    if (value === CREATE_NEW_PROVIDER) {
      setShowProviderForm(true);
      setSelectedProvider(null);
      form.setFieldValue("providerId", undefined);
    } else {
      setShowProviderForm(false);
      const provider = providers.find((p) => p.id === value);
      setSelectedProvider(provider || null);
    }
  };

  const handleProviderSearch = (value: string) => {
    if (searchRef.current) {
      clearTimeout(searchRef.current);
    }
    searchRef.current = setTimeout(() => {
      fetchProviders(value || undefined);
    }, 300);
  };

  const handleTestProvider = async () => {
    if (!testToken.trim()) {
      message.warning("请输入测试 Token");
      return;
    }

    const providerValues = form.getFieldValue("provider");
    if (!providerValues?.validUrl) {
      message.warning("请先填写验证 URL");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await testProviderApi({
        validUrl: providerValues.validUrl,
        method: providerValues.method || "GET",
        attachType: providerValues.attachType || "BEARER",
        token: testToken,
        config: {
          location: providerValues.config?.location || "headers",
          key: providerValues.config?.key || "Authorization",
          prefix: providerValues.config?.prefix || "Bearer ",
          postfix: providerValues.config?.postfix,
          uidExpl: providerValues.config?.uidExpl,
        },
      });

      if (res.data?.success) {
        setTestResult({
          success: true,
          uid: res.data.uid,
        });
        message.success("测试成功");
      } else {
        setTestResult({
          success: false,
          error: res.message || "测试失败",
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        error: e.message || "请求失败",
      });
    } finally {
      setTesting(false);
    }
  };

  const validateStep = async (step: number) => {
    if (step === 0) {
      await form.validateFields(["name"]);
    }
    // step 1 的验证在提交时进行
  };

  const handleStepClick = async (targetStep: number) => {
    // 如果要前进到下一步，需要验证当前步骤
    if (targetStep > currentStep) {
      try {
        await validateStep(currentStep);
        setCurrentStep(targetStep);
      } catch {
        // validation failed
      }
    } else {
      // 返回上一步不需要验证
      setCurrentStep(targetStep);
    }
  };

  const handleNext = async () => {
    await handleStepClick(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let providerId = values.providerId;

      if (showProviderForm && values.provider) {
        await createProvider(values.provider);
        await fetchProviders();
        const { providers: updatedProviders } = useRealmStore.getState();
        providerId = updatedProviders[updatedProviders.length - 1]?.id;
      }

      if (!providerId) {
        message.error("请选择或创建 Provider");
        return;
      }

      if (isEdit && realm) {
        await updateRealm(realm.id, {
          id: realm.id,
          name: values.name,
          desc: values.desc,
          enabled: values.enabled,
          shared: values.shared,
          providerId,
        });
        message.success("更新成功");
      } else {
        await createRealm({
          id: "",
          name: values.name,
          desc: values.desc,
          enabled: values.enabled,
          shared: values.shared,
          providerId,
        });
        message.success("创建成功");
      }
      navigate("/realm");
    } catch {
      message.error(isEdit ? "更新失败" : "创建失败");
    }
  };

  return (
    <main className="w-full bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEdit ? "编辑安全域" : "新建安全域"}
                </h1>
                {isEdit && realm ? (
                  <p className="text-sm text-gray-500 font-mono">{realm.id}</p>
                ) : (
                  <p className="text-sm text-gray-500">配置认证领域</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1 mb-10 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
          {[
            { step: 0, title: "基本信息", icon: Key },
            { step: 1, title: "认证配置", icon: Globe },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                onClick={() => handleStepClick(item.step)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-white dark:bg-black shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-black/50"
                  }
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium
                    ${
                      isActive
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : ""
                    }
                    ${
                      isCompleted
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : ""
                    }
                    ${
                      !isActive && !isCompleted
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500"
                        : ""
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : item.step + 1}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive || isCompleted
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              enabled: true,
              shared: "private",
              provider: {
                method: "GET",
                attachType: "BEARER",
                enabled: true,
                shared: "private",
                config: {
                  location: "headers",
                  key: "Authorization",
                  prefix: "Bearer ",
                  tokenFormat: "apiKey",
                },
              },
            }}
            className="p-6"
          >
            {/* Step 1 */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    为安全域设置名称和访问权限
                  </p>
                </div>

                <Form.Item
                  name="name"
                  label={
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      名称
                    </span>
                  }
                  rules={[{ required: true, message: "请输入名称" }]}
                >
                  <Input placeholder="OpenAI Authentication" size="large" />
                </Form.Item>

                <Form.Item
                  name="desc"
                  label={
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      描述 <span className="text-gray-400">(可选)</span>
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="用于验证 OpenAI API Key"
                  />
                </Form.Item>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Form.Item
                        name="enabled"
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <Switch />
                      </Form.Item>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        启用
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        共享范围
                      </span>
                      <Form.Item name="shared" className="mb-0">
                        <Select style={{ width: 100 }}>
                          <Select.Option value="private">私有</Select.Option>
                          <Select.Option value="tenant">租户内</Select.Option>
                          <Select.Option value="global">全局</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    选择或创建认证提供者
                  </p>
                </div>

                <Form.Item
                  name="providerId"
                  label={
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Provider
                    </span>
                  }
                  rules={[
                    { required: !showProviderForm, message: "请选择 Provider" },
                  ]}
                >
                  <Select
                    placeholder="搜索或选择 Provider"
                    loading={loading}
                    onChange={handleProviderChange}
                    onSearch={handleProviderSearch}
                    showSearch
                    filterOption={false}
                    allowClear
                    size="large"
                  >
                    {providers.map((p) => (
                      <Select.Option key={p.id} value={p.id}>
                        <div className="flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-xs text-gray-400 font-mono">
                            {p.config?.tokenFormat || "apiKey"}
                          </span>
                        </div>
                      </Select.Option>
                    ))}
                    <Select.Option
                      key={CREATE_NEW_PROVIDER}
                      value={CREATE_NEW_PROVIDER}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>New Provider</span>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>

                {/* 选中的 Provider 详情 */}
                {selectedProvider && !showProviderForm && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedProvider.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedProvider.desc || "无描述"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">验证方法</p>
                        <p className="text-gray-900 dark:text-white font-mono">
                          {selectedProvider.method}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">附加类型</p>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.attachType}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">验证 URL</p>
                        <p className="text-gray-900 dark:text-white font-mono text-xs break-all">
                          {selectedProvider.validUrl}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Token 格式</p>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.config?.tokenFormat || "apiKey"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Token 位置</p>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.config?.location || "headers"}
                        </p>
                      </div>
                      {selectedProvider.config?.key && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Header Key
                          </p>
                          <p className="text-gray-900 dark:text-white font-mono">
                            {selectedProvider.config.key}
                          </p>
                        </div>
                      )}
                      {selectedProvider.config?.prefix && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">前缀</p>
                          <p className="text-gray-900 dark:text-white font-mono">
                            {selectedProvider.config.prefix}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          selectedProvider.enabled
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                        }`}
                      >
                        {selectedProvider.enabled ? "已启用" : "已禁用"}
                      </span>
                      <span className="text-xs text-gray-500">
                        共享：
                        {selectedProvider.shared === "global"
                          ? "全局"
                          : selectedProvider.shared === "tenant"
                          ? "租户内"
                          : "私有"}
                      </span>
                    </div>
                  </div>
                )}

                {/* 新建 Provider */}
                {showProviderForm && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                          label={
                            <span className="text-xs text-gray-500">名称</span>
                          }
                          name={["provider", "name"]}
                          rules={[{ required: true, message: "必填" }]}
                          className="mb-0"
                        >
                          <Input placeholder="OpenAI Platform" />
                        </Form.Item>
                        <Form.Item
                          label={
                            <span className="text-xs text-gray-500">
                              验证方法
                            </span>
                          }
                          name={["provider", "method"]}
                          className="mb-0"
                        >
                          <Select>
                            <Select.Option value="GET">GET</Select.Option>
                            <Select.Option value="POST">POST</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>

                      <Form.Item
                        label={
                          <span className="text-xs text-gray-500">
                            验证 URL
                          </span>
                        }
                        name={["provider", "validUrl"]}
                        rules={[
                          { required: true, message: "必填" },
                          { type: "url", message: "无效 URL" },
                        ]}
                        className="mb-0"
                      >
                        <Input
                          placeholder="https://api.openai.com/v1/models"
                          className="font-mono text-sm"
                        />
                      </Form.Item>

                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                          label={
                            <span className="text-xs text-gray-500">
                              附加类型
                            </span>
                          }
                          name={["provider", "attachType"]}
                          className="mb-0"
                        >
                          <Select>
                            <Select.Option value="BEARER">
                              Bearer Token
                            </Select.Option>
                            <Select.Option value="BASIC">
                              Basic Auth
                            </Select.Option>
                            <Select.Option value="CUSTOM">Custom</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label={
                            <span className="text-xs text-gray-500">
                              Token 格式
                            </span>
                          }
                          name={["provider", "config", "tokenFormat"]}
                          className="mb-0"
                        >
                          <Select>
                            <Select.Option value="apiKey">
                              API Key
                            </Select.Option>
                            <Select.Option value="jwt">JWT</Select.Option>
                            <Select.Option value="basic">Basic</Select.Option>
                            <Select.Option value="oauth2">OAuth2</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>

                      {/* 高级配置 */}
                      <Collapse
                        ghost
                        className="!-mx-1 !bg-white dark:!bg-gray-950 !rounded-lg !border !border-gray-200 dark:!border-gray-800"
                        items={[
                          {
                            key: "advanced",
                            label: (
                              <span className="text-xs text-gray-500">
                                高级配置
                              </span>
                            ),
                            children: (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Form.Item
                                    label={
                                      <span className="text-xs text-gray-500">
                                        Token 位置
                                      </span>
                                    }
                                    name={["provider", "config", "location"]}
                                    className="mb-0"
                                  >
                                    <Select size="small">
                                      <Select.Option value="headers">
                                        Headers
                                      </Select.Option>
                                      <Select.Option value="query">
                                        Query
                                      </Select.Option>
                                      <Select.Option value="body">
                                        Body
                                      </Select.Option>
                                      <Select.Option value="cookie">
                                        Cookie
                                      </Select.Option>
                                      <Select.Option value="cert">
                                        Cert
                                      </Select.Option>
                                    </Select>
                                  </Form.Item>
                                  <Form.Item
                                    label={
                                      <span className="text-xs text-gray-500">
                                        Header Key
                                      </span>
                                    }
                                    name={["provider", "config", "key"]}
                                    className="mb-0"
                                  >
                                    <Input
                                      size="small"
                                      placeholder="Authorization"
                                      className="font-mono"
                                    />
                                  </Form.Item>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <Form.Item
                                    label={
                                      <span className="text-xs text-gray-500">
                                        前缀
                                      </span>
                                    }
                                    name={["provider", "config", "prefix"]}
                                    className="mb-0"
                                  >
                                    <Input
                                      size="small"
                                      placeholder="Bearer "
                                      className="font-mono"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label={
                                      <span className="text-xs text-gray-500">
                                        后缀
                                      </span>
                                    }
                                    name={["provider", "config", "postfix"]}
                                    className="mb-0"
                                  >
                                    <Input size="small" className="font-mono" />
                                  </Form.Item>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <Form.Item
                                    label={
                                      <span className="text-xs text-gray-500">
                                        算法
                                      </span>
                                    }
                                    name={["provider", "config", "algorithm"]}
                                    className="mb-0"
                                  >
                                    <Input
                                      size="small"
                                      placeholder="HS256"
                                      className="font-mono"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label={
                                      <span className="text-xs text-gray-500">
                                        UID 表达式
                                      </span>
                                    }
                                    name={["provider", "config", "uidExpl"]}
                                    className="mb-0"
                                  >
                                    <Input
                                      size="small"
                                      placeholder="$.data.user.id"
                                      className="font-mono"
                                    />
                                  </Form.Item>
                                </div>

                                {/* Provider 启用和共享 */}
                                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          启用 Provider
                                        </span>
                                        <Form.Item
                                          name={["provider", "enabled"]}
                                          valuePropName="checked"
                                          className="mb-0"
                                        >
                                          <Switch size="small" />
                                        </Form.Item>
                                      </div>
                                    </div>
                                    <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          共享范围
                                        </span>
                                        <Form.Item
                                          name={["provider", "shared"]}
                                          className="mb-0"
                                        >
                                          <Select
                                            size="small"
                                            style={{ width: 90 }}
                                          >
                                            <Select.Option value="private">
                                              私有
                                            </Select.Option>
                                            <Select.Option value="tenant">
                                              租户内
                                            </Select.Option>
                                            <Select.Option value="global">
                                              全局
                                            </Select.Option>
                                          </Select>
                                        </Form.Item>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          },
                        ]}
                      />

                      {/* 测试 Provider */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 mb-3">
                          测试配置 - 输入 Token 验证配置是否正确
                        </p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="输入测试 Token，例如: sk-xxx"
                            value={testToken}
                            onChange={(e) => setTestToken(e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                          <Button
                            onClick={handleTestProvider}
                            loading={testing}
                            icon={
                              testing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )
                            }
                          >
                            测试
                          </Button>
                        </div>
                        {/* 预留测试结果区域，避免高度跳动 */}
                        <div
                          className={`mt-3 p-3 rounded-lg text-sm min-h-[50px] flex items-center transition-colors duration-200 ${
                            testResult
                              ? testResult.success
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                              : "bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {testResult ? (
                            testResult.success ? (
                              <div>
                                <p className="text-green-700 dark:text-green-400 font-medium">
                                  ✓ 测试成功
                                </p>
                                {testResult.uid && (
                                  <p className="text-green-600 dark:text-green-500 mt-1">
                                    提取的 UID：
                                    <span className="font-mono">
                                      {testResult.uid}
                                    </span>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-red-700 dark:text-red-400">
                                ✗ {testResult.error}
                              </p>
                            )
                          ) : (
                            <p className="text-gray-400 text-xs"></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Form>

          {/* Actions */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <Button type="text" onClick={() => navigate("/realm")}>
              取消
            </Button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrev}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  上一步
                </Button>
              )}
              {currentStep === 0 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  className="!bg-black dark:!bg-white !text-white dark:!text-black hover:!bg-gray-800 dark:hover:!bg-gray-200 !border-0"
                >
                  下一步
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  icon={<Check className="w-4 h-4" />}
                  className="!bg-black dark:!bg-white !text-white dark:!text-black hover:!bg-gray-800 dark:hover:!bg-gray-200 !border-0"
                >
                  {isEdit ? "保存" : "创建"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
