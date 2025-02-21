import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Space, Popconfirm } from 'antd';
import AuthSchemeForm from './AuthSchemeForm';
import { AuthType, FormValues, NewAuthProps, Realm } from '#/entity';
import { deleteRealms, postRealms, putRealms, selectRealms } from '@/api/services/callgentService';
import useTreeActionStore, { useFetchCallgentTree, useTreeActions } from '@/store/callgentTreeStore';

interface ExtendedNewAuthProps extends NewAuthProps {
  onUpdate?: (updatedItem: Realm) => void;
  onDelete?: () => void;
  isNew?: boolean;
}

const NewAuth: React.FC<ExtendedNewAuthProps> = ({ initialData, callgentId, onUpdate, onDelete, isNew = false }) => {
  const [form] = Form.useForm();
  const [isEditable, setIsEditable] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const featchCallgentTree = useFetchCallgentTree();
  const { action, currentNode } = useTreeActionStore();
  const defaultValues: FormValues = {
    callgentId: callgentId || '',
    authType: 'apiKey',
    realm: '',
    scheme: { type: 'apiKey', in: 'header', name: '', provider: '', secret: '' },
    secret: {},
  };

  useEffect(() => {
    setIsEditable(isNew);
    form.setFieldsValue(initialData || defaultValues);
  }, [initialData, callgentId, form, isNew]);

  const handleAuthTypeChange = (value: AuthType) => {
    form.setFieldsValue({
      scheme: { type: value, in: 'header', name: '', provider: '', secret: '' }
    });
  };
  const { closeModal } = useTreeActions();
  const onFinish = async (values: Realm) => {
    setIsSubmitting(true);
    try {
      if (action === "select") {
        if (!initialData) {
          return null
        }
        await selectRealms(currentNode!, initialData?.realmKey)
      } else if (isNew) {
        await postRealms({
          ...values,
          callgentId
        })
      } else {
        await putRealms({
          ...values,
          callgentId
        })
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

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await deleteRealms({ callgentId, ...initialData })
        await featchCallgentTree(callgentId!);
        onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={defaultValues}
        className="flex-1 max-h-[400px] overflow-auto"
        layout="vertical"
        disabled={!isEditable}
      >
        <Form.Item
          label="Scheme Type"
          name="authType"
          rules={[{ required: true, message: 'Please select scheme type' }]}
        >
          <Select onChange={handleAuthTypeChange}>
            <Select.Option value="apiKey">apiKey</Select.Option>
            <Select.Option value="http">http</Select.Option>
            <Select.Option value="oauth2">oauth2</Select.Option>
            <Select.Option value="openIdConnect">openIdConnect</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item shouldUpdate={(prev, curr) => prev.authType !== curr.authType}>
          {({ getFieldValue }) => (
            <AuthSchemeForm
              authType={getFieldValue('authType') as AuthType}
            />
          )}
        </Form.Item>

        <div className="flex justify-between items-center p-4">
          <Space>
            {(!isNew && action !== "select") && (
              <Button onClick={handleEdit} disabled={isEditable}>
                Edit
              </Button>
            )}
            {!isNew && action !== "select" && initialData && (
              <Popconfirm
                title="Are you sure to delete this authentication?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger loading={isDeleting}>
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            className="ml-auto"
            disabled={action === "select" ? false : !isEditable}
          >
            {action === "select" ? "Select" : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewAuth;