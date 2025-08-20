import { createCallgentEntry, editCallgentEntry, importEntry, putCallgent, selectRealms } from '@/api/services/callgentService';
import { useFetchCallgentTree, useTreeActions, useTreeActionStore } from '@/models/callgentTreeStore';
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
    const { adaptorKey, text } = values;
    try {
      switch (state.action) {
        case 'add':
          delete values?.adaptorKey
          await createCallgentEntry({
            adaptor: adaptorKey,
            formValues: {
              ...values,
              callgentId: callgentTree[0]?.id,
              type: state.currentNode?.type,
            },
          });
          await fetchCallgentTree(callgentTree[0].id!);
          break;
        case 'edit':
          if (currentNode?.parentType === 'root') {
            await putCallgent(currentNode.id!, values)
          } else {
            await editCallgentEntry({
              id: currentNode.id!,
              formValues: values,
            });
          }
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
          const result = selectRealm.map((item: string) => ({ realmId: item }));
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
          label={`${currentNode?.modelTitle || ''} adaptor`}
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
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter node name' }]}>
          <Input placeholder="Enter node name" />
        </Form.Item>
        <Form.Item label="Host" name="host" rules={[{ required: true, message: 'Please enter node host' }]}>
          <Input placeholder="Enter node host" />
        </Form.Item>
        <Form.Item label="whatFor" name="whatFor" rules={[{ required: false, message: 'Please describe the purpose of this entries' }]}>
          <Input.TextArea placeholder="Describe the purpose of this node (e.g., its function or goal)" />
        </Form.Item>
        <Form.Item label={currentNode?.parentType === "CLIENT" ? "how2Exe" : "how2Ops"} name="how2Ops" rules={[{ required: false, message: 'Please explain how to use this entries' }]}>
          <Input.TextArea placeholder="Provide usage instructions for this node (e.g., steps to operate it)" />
        </Form.Item>
      </>
    ),
    edit: (
      <>
        <Divider />
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter node name' }]}>
          <Input placeholder="Enter node name" />
        </Form.Item>
        {currentNode?.modelTitle !== 'Callgent' && (
          <Form.Item label="Host" name="host" rules={[{ required: true, message: 'Please enter node host' }]}>
            <Input placeholder="Enter node host" />
          </Form.Item>
        )}
        <Form.Item label="whatFor" name="whatFor" rules={[{ required: false, message: 'Please describe the purpose of this entries' }]}>
          <Input.TextArea placeholder="Describe the purpose of this node (e.g., its function or goal)" />
        </Form.Item>
        {currentNode?.modelTitle === 'Callgent' && (
          <Form.Item label="how2Use" name="how2Use" rules={[{ required: false, message: 'Please explain how to use this entries' }]}>
            <Input.TextArea placeholder="Provide usage instructions for this node (e.g., steps to operate it)" />
          </Form.Item>
        )}
        {currentNode?.modelTitle !== 'Callgent' && (
          <Form.Item label={currentNode?.parentType === "CLIENT" ? "how2Exe" : "how2Ops"} name="how2Ops" rules={[{ required: false, message: 'Please explain how to use this entries' }]}>
            <Input.TextArea placeholder="Provide usage instructions for this node (e.g., steps to operate it)" />
          </Form.Item>
        )}
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
              <Checkbox key={option.id} value={option.id}>
                {option.realmKey}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </>
    ),
    lock: null,
    virtualApi: null,
  };
  return action ? (
    (
      <Form
        {...formItemLayout}
        onFinish={onSubmit}
        initialValues={{
          ...currentNode?.data || {},
          adaptorKey: adaptors.length > 0 ? adaptors[0].name : undefined,
          host: (action === 'edit' || action === 'select') ? currentNode?.data?.host : undefined,
          name: action === 'add' ? undefined : currentNode?.data?.name,
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