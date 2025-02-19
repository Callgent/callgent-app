import { useCreateCallgentEntry, useEditCallgentEntry, useImportEntry } from '@/api/services/callgentService';
import { useAdaptors, useCallgentTree, useCurrentNode, useFetchCallgentTree, useTreeActions, useTreeActionStore } from '@/store/callgentTreeStore';
import { Form, Input, Button, Select, Divider } from 'antd';
import { useState } from 'react';

export const ActionForm = () => {
  const { action } = useTreeActionStore();

  const createCallgentEntry = useCreateCallgentEntry();
  const editCallgentEntry = useEditCallgentEntry();
  const importEntry = useImportEntry();

  const { closeModal } = useTreeActions();
  const callgentTree = useCallgentTree();
  const currentNode = useCurrentNode();
  const adaptors = useAdaptors();

  const [loading, setLoading] = useState(false);

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const fetchCallgentTree = useFetchCallgentTree()
  const onSubmit = async (values: any) => {
    setLoading(true);
    const state = useTreeActionStore.getState();
    if (!callgentTree[0]?.id || !currentNode) {
      setLoading(false);
      return null;
    }
    const { host, adaptorKey, text } = values;
    try {
      switch (state.action) {
        case 'add':
          await createCallgentEntry.mutateAsync({
            adaptor: adaptorKey,
            formValues: {
              host,
              callgentId: callgentTree[0]?.id,
              type: state.currentNode?.type,
            },
          })
          await fetchCallgentTree(callgentTree[0].id!)
          break;
        case 'edit':
          await editCallgentEntry.mutateAsync({
            id: currentNode.id,
            formValues: { host },
          })
          await fetchCallgentTree(callgentTree[0].id!)
          break;
        case 'import':
          await importEntry.mutateAsync({
            formValues: { text, entryId: currentNode.id },
          })
          await fetchCallgentTree(callgentTree[0].id!)
          break;
      }
      closeModal();
    } catch (error) {
      console.error('Submit failed:', error);
    }
    setLoading(false);
  };

  const formContent = {
    add: (
      <>
        <Divider />
        <Form.Item label="CLIENT Entry adaptor" name="adaptorKey" rules={[{ required: true, message: 'Please select an adapter' }]}>
          <Select placeholder="Select an adapter" style={{ width: '100%' }}>
            {adaptors.map((item) => (
              <Select.Option value={item.name} key={item.name}>{item.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Name" name="host" rules={[{ required: true, message: 'Please enter node name' }]}>
          <Input placeholder="Enter node name" />
        </Form.Item>
      </>
    ),
    edit: (
      <>
        <Divider />
        <Form.Item label="Name" name="host" rules={[{ required: true, message: 'Please enter a new name' }]}>
          <Input placeholder="Enter new name" />
        </Form.Item>
      </>
    ),
    import: (
      <>
        <Divider />
        <Form.Item label="Import Description" name="text" rules={[{ required: true, message: 'Please enter import description' }]}>
          <Input.TextArea placeholder="Enter import description" rows={3} />
        </Form.Item>
      </>
    ),
    lock: (
      <>
        <Divider />
        <Form.Item label="Authorization Description" name="text" rules={[{ required: true, message: 'Please enter authorization details' }]}>
          <Input.TextArea placeholder="Enter authorization details" rows={3} />
        </Form.Item>
      </>
    )
  };

  return action ? (
    <Form {...formItemLayout} onFinish={onSubmit} initialValues={{
      adaptorKey: adaptors.length > 0 ? adaptors[0].name : undefined,
      host: action === 'edit' ? currentNode?.data?.name : undefined,
    }}>
      {formContent[action]}
      <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'right' }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {action === 'add' ? 'Create' : action === 'edit' ? 'Update' : 'Import'}
        </Button>
      </Form.Item>
    </Form>
  ) : null;
};
