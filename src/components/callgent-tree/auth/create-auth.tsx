import useTreeActionStore, { useFetchCallgentTree, useTreeActions } from '@/models/callgentTreeStore';
import { deleteRealms, postRealms, putRealms } from '@/api/services/callgentService';
import { AuthType, FormValues, NewAuthProps, Realm } from '#/entity';
import { Form, Select, Button, Space, Popconfirm } from 'antd';
import React, { useState, useEffect } from 'react';
import AuthSchemeForm from './scheme-form';

const NewAuth: React.FC<NewAuthProps> = ({ callgentId }) => {
  const [form] = Form.useForm();
  const defaultValues: FormValues = {
    callgentId: callgentId || '',
    authType: 'apiKey',
    scheme: { type: 'apiKey', in: 'header', name: '', provider: '', secret: '' }
  };
  const { realms, realmKey } = useTreeActionStore();
  const { closeModal, setRealmKey } = useTreeActions();
  const initialData = realms.find(item => realmKey === item.id);
  const [isEditable, setIsEditable] = useState(initialData ? false : true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const featchCallgentTree = useFetchCallgentTree();

  useEffect(() => {
    setIsEditable(isEditable);
    form.setFieldsValue(initialData || defaultValues);
  }, [initialData, callgentId, form]);

  const handleAuthTypeChange = (value: AuthType) => {
    form.setFieldsValue({
      scheme: { type: value, in: 'header', name: '', provider: '', secret: '' }
    });
  };

  const onFinish = async (values: Realm) => {
    if (!values?.pricingEnabled) {
      delete values?.pricing;
    }
    delete values?.pricingEnabled;
    setIsSubmitting(true);
    try {
      if (isEditable && !initialData) {
        // add
        const { data } = await postRealms({ ...values, callgentId });
        setRealmKey(data?.id || 'new');
      } else {
        // edit
        await putRealms({ ...values, id: initialData && initialData.id || '', callgentId });
      }
      await featchCallgentTree(callgentId!);
      setIsEditable(false);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      closeModal();
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => setIsEditable(true);

  const handleDelete = async () => {
    if (initialData) {
      setIsDeleting(true);
      try {
        await deleteRealms({ callgentId, ...initialData });
        const data = await featchCallgentTree(callgentId!);
        setRealmKey(data?.realms![0]?.id || 'new')
      } finally {
        setIsDeleting(false);
      }
    }
  };
  const formValues = Form.useWatch([], form);
  useEffect(() => {
    setIsEditable(false)
    if (realmKey === 'new') {
      form.resetFields();
      setIsEditable(true)
    }
  }, [realmKey])
  return (
    <div className="h-full flex flex-col">
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={defaultValues}
        layout="vertical"
        disabled={!isEditable}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8"
      >
        <Form.Item
          label="Scheme Type"
          name="authType"
          rules={[{ required: true, message: 'Please select scheme type' }]}>
          <Select onChange={handleAuthTypeChange}>
            <Select.Option value="apiKey">apiKey</Select.Option>
            <Select.Option value="jwt">jwt</Select.Option>
            <Select.Option value="http">http</Select.Option>
            <Select.Option value="oauth2">oauth2</Select.Option>
            <Select.Option value="openIdConnect">openIdConnect</Select.Option>
          </Select>
        </Form.Item>
        <AuthSchemeForm formValues={{ ...initialData, ...formValues }} />
        <div className="flex justify-end items-center p-4 sm:col-span-2 lg:col-span-3">
          <Space>
            <Button
              onClick={handleEdit}
              disabled={isEditable}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete this authentication?"
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ disabled: false }}
              cancelButtonProps={{ disabled: false }}
            >
              <Button
                loading={isDeleting}
                disabled={isEditable}
                danger
              >
                Delete
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={!isEditable}
            >
              Submit
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default NewAuth;
