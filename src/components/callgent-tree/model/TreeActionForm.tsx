import { createCallgentEntry, editCallgentEntry, importEntry, selectRealms } from '@/api/services/callgentService';
import { useFetchCallgentTree, useTreeActions, useTreeActionStore } from '@/store/callgentTreeStore';
import { Form, Input, Button, Select, Divider, Checkbox } from 'antd';
import { useState } from 'react';

export const ActionForm = () => {
  const { action } = useTreeActionStore();
  const { closeModal } = useTreeActions();
  const { callgentTree, currentNode, adaptors, realms } = useTreeActionStore();
  const [loading, setLoading] = useState(false);

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const fetchCallgentTree = useFetchCallgentTree();

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
          await createCallgentEntry({
            adaptor: adaptorKey,
            formValues: {
              host,
              callgentId: callgentTree[0]?.id,
              type: state.currentNode?.type,
            },
          });
          await fetchCallgentTree(callgentTree[0].id!);
          break;
        case 'edit':
          await editCallgentEntry({
            id: currentNode.id!,
            formValues: { host },
          });
          await fetchCallgentTree(callgentTree[0].id!);
          break;
        case 'import':
          await importEntry({
            formValues: { text, entryId: currentNode.id },
          });
          await fetchCallgentTree(callgentTree[0].id!);
          break;
        case 'select':
          const selectRealm = values?.selectedOptions || [];
          const result = selectRealm.map((item: string) => ({ apiKey: item }));
          console.log(currentNode, result);

          await selectRealms(currentNode, result);
          await fetchCallgentTree(callgentTree[0].id!);
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
        <Form.Item
          label="CLIENT Entry adaptor"
          name="adaptorKey"
          rules={[{ required: true, message: 'Please select an adapter' }]}
        >
          <Select placeholder="Select an adapter" style={{ width: '100%' }}>
            {adaptors.map((item) => (
              <Select.Option value={item.name} key={item.name}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Name" name="host" rules={[{ required: true, message: 'Please enter node name' }]}>
          <Input placeholder="Enter node name" />
        </Form.Item>
        <Form.Item label="summary" name="summary" rules={[{ required: false, message: 'Please enter node summary' }]}>
          <Input.TextArea placeholder="Enter node summary" />
        </Form.Item>
        <Form.Item label="instruction" name="instruction" rules={[{ required: false, message: 'Please enter node instruction' }]}>
          <Input.TextArea placeholder="Enter node instruction" />
        </Form.Item>
      </>
    ),
    edit: (
      <>
        <Divider />
        <Form.Item label="Name" name="host" rules={[{ required: true, message: 'Please enter a new name' }]}>
          <Input placeholder="Enter new name" />
        </Form.Item>
        <Form.Item label="summary" name="summary" rules={[{ required: false, message: 'Please enter node summary' }]}>
          <Input.TextArea placeholder="Enter node summary" />
        </Form.Item>
        <Form.Item label="instruction" name="instruction" rules={[{ required: false, message: 'Please enter node instruction' }]}>
          <Input.TextArea placeholder="Enter node instruction" />
        </Form.Item>
      </>
    ),
    import: (
      <>
        <Divider />
        <Form.Item
          label="Import Description"
          name="text"
          rules={[{ required: true, message: 'Please enter import description' }]}
        >
          <Input.TextArea placeholder="Enter import description" rows={3} />
        </Form.Item>
      </>
    ),
    select: (
      <>
        <Divider />
        <Form.Item label="Name" name="host" rules={[{ required: false, message: 'Please enter a new name' }]}>
          <Input placeholder="Enter new name" disabled={true} />
        </Form.Item>
        <Form.Item
          label="Select Options"
          name="selectedOptions"
          rules={[{ required: false, message: 'Please select at least one option' }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            {realms.map((option) => (
              <Checkbox key={option.realmKey} value={option.realmKey}>
                {option.realm}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </>
    ),
    lock: null
  };

  return action ? (
    (
      <Form
        {...formItemLayout}
        onFinish={onSubmit}
        initialValues={{
          adaptorKey: adaptors.length > 0 ? adaptors[0].name : undefined,
          host: (action === 'edit' || action === 'select') ? currentNode?.data?.name : undefined,
        }}
      >
        {formContent[action]}
        <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            {action === 'add' ? 'Create' : action === 'edit' ? 'Update' : action === 'import' ? 'Import' : 'select'}
          </Button>
        </Form.Item>
      </Form>
    )
  ) : null;
};