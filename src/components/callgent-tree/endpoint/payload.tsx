import { useState } from 'react'
import { Input, Select, Button, Modal, Form, Checkbox, message, Tag } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { commitEdit, deleteNodes, recursiveAdd, updateNode } from '@/utils/callgent-tree'

const typeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'integer', value: 'integer' },
  { label: 'boolean', value: 'boolean' },
  { label: 'array', value: 'array' },
  { label: 'object', value: 'object' }
]

const positionOptions = [
  { label: 'path', value: 'path' },
  { label: 'query', value: 'query' },
  { label: 'header', value: 'header' },
  { label: 'cookie', value: 'cookie' },
  { label: 'body', value: 'body' }
]

export default function PayloadCom({
  data = [],
  onSubmit,
  mode = 'request'
}: {
  data?: any[]
  onSubmit?: (tree: any[]) => void
  mode?: 'request' | 'response'
}) {
  const [treeData, setTreeData] = useState<any[]>(data)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')

  const [modalVisible, setModalVisible] = useState(false)
  const [currentEditNode, setCurrentEditNode] = useState<any>(null)
  const [form] = Form.useForm()

  const submitEdit = (key: string, value: string) => {
    const newData = commitEdit(treeData, key, value)
    setTreeData(newData)
    onSubmit?.(newData)
    setEditingKey(null)
  }

  const addNode = (parentKey?: string) => {
    if (editingKey !== null) {
      message.warning('Please complete the current field editing first.')
      return
    }
    const newKey = Date.now().toString()
    const newNode = {
      key: newKey,
      name: '',
      type: 'string',
      description: '',
      ...(mode === 'request' ? { in: 'body' } : {}),
      default: '',
      required: false,
      children: []
    }

    if (!parentKey) {
      setTreeData(prev => [...prev, newNode])
    } else {
      setTreeData(prev => recursiveAdd(prev, parentKey, newNode))
    }
    setEditingKey(newKey)
    setEditingValue('')
  }

  const openEditModal = (node: any) => {
    setCurrentEditNode(node)
    setModalVisible(true)
    form.setFieldsValue(node)
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newData = updateNode(treeData, currentEditNode.key, values)
      setTreeData(newData)
      onSubmit?.(newData)
      setModalVisible(false)
    })
  }

  const renderNode = (node: any, level = 0) => {
    const isEditing = editingKey === node.key
    return (
      <div key={node.key} className="group pl-2 mt-1">
        <div className="p-1 flex items-center justify-between hover:bg-gray-200 rounded">
          <div>
            {isEditing ? (
              <div className="space-x-3 flex">
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onPressEnter={() => submitEdit(node.key, editingValue)}
                  autoFocus
                  size="small"
                  className="w-36 text-black"
                />
                <Button size="small" type="primary" onClick={() => submitEdit(node.key, editingValue)}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="w-36 px-2 cursor-pointer" onClick={() => {
                if (editingKey === null) {
                  setEditingKey(node.key)
                  setEditingValue(node.name)
                }
              }}>
                {node.name || <span className="text-gray-400">Unnamed</span>}
              </div>
            )}
          </div>

          <div className="space-x-2 flex items-center">
            {node.type === 'object' && (
              <div
                className="w-4 h-4 border border-gray-400 rounded-sm text-center leading-[0.8rem] cursor-pointer hover:border-blue-500 hover:text-blue-600"
                onClick={() => addNode(node.key)}
              >
                +
              </div>
            )}

            <Tag color="green">{node.type}</Tag>

            <Button size="small" danger
              onClick={() => {
                const newData = deleteNodes(treeData, node.key)
                setTreeData(newData)
                onSubmit?.(newData)
                if (editingKey === node.key) {
                  setEditingKey(null)
                }
              }}
              icon={<DeleteOutlined />}
            />
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(node)} />
          </div>
        </div>

        {node.children?.map((child: any) => renderNode(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="w-full text-sm font-mono space-y-2 px-2 pb-2">
      <div>{treeData.map((node: any) => renderNode(node))}</div>
      <div
        className="mb-2 w-full text-center py-2 border border-dashed border-gray-400 rounded-md text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition"
        onClick={() => addNode()}
      >
        + Add
      </div>

      <Modal
        title="Edit Node Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Field Name" name="name" rules={[{ required: true, message: 'Please enter a field name' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select options={typeOptions} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>

          {mode === 'request' && (
            <Form.Item label="Location" name="in">
              <Select options={positionOptions} />
            </Form.Item>
          )}

          <Form.Item label="Default Value" name="default">
            <Input />
          </Form.Item>
          {mode === 'request' && (
            <Form.Item name="required" valuePropName="checked">
              <Checkbox>Required</Checkbox>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
