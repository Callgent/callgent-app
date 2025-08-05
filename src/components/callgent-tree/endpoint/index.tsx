import { useState } from 'react'
import { Input, Button, Tabs, Modal } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import useTreeActionStore, { useTreeActions } from '@/models/callgentTreeStore'
import Payload from './payload'
import Mapping from './mapping'
import { useSchemaTreeStore } from '../SchemaTree/store'
export default function EndpointPage() {
  const { status, formData, activeKey, handleConfirm, clear, setFormData, setActiveKey } = useEndpointStore()
  const { currentNode } = useTreeActionStore()
  const { closeModal } = useTreeActions()
  // AI generation states
  const [aiInputVisible, setAiInputVisible] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const { parameters, requestBody, responses, clearSchemaTreeStore } = useSchemaTreeStore()

  // Reset all states or 弹出确认框
  const handleCancel = () => {
    if (status === 'edit') {
      close()
      return
    }
    Modal.confirm({
      title: '确认关闭？',
      content: '所有未保存的更改将会丢失，是否确定取消？',
      okText: '确认',
      cancelText: '返回',
      okButtonProps: { className: 'bg-primary text-white border-none' },
      centered: true,
      onOk() {
        close()
      }
    })
  }

  // 彻底关闭并重置
  const close = () => {
    clear()
    clearSchemaTreeStore()
    closeModal()
    setActiveKey('1')
  }

  // 提交数据
  const handleSubmit = (node: any) => {
    if (node?.type === 'CLIENT') {
      setFormData({
        ...formData,
        metaExe: { ...formData?.metaExe, parameters, requestBody, responses },
      })
    } else {
      setFormData({ ...formData, parameters, requestBody, responses })
    }
    setTimeout(() => {
      handleConfirm(node)
    }, 50)
  }

  // useBeforeunload(() => {
  //   return shouldPreventNavigation({ confirm: false }) ? 'back' : false;
  // });

  return (
    <div className="w-full mr-4">
      <div className="mx-auto rounded-lg p-6 space-y-6 border-2 border-gray-300 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold font-sans">Functional Endpoint</h2>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setAiInputVisible(v => !v)}
          >
            AI Generate
          </button>
        </div>
        {!aiInputVisible ? (
          currentNode?.type === 'CLIENT' ? (
            <Tabs
              activeKey={activeKey}
              onChange={setActiveKey}
              items={[
                { key: '1', label: 'Define', children: <Payload /> },
                { key: '2', label: 'Implement', children: <Mapping /> },
              ]}
            />
          ) : (
            <Payload />
          )
        ) : (
          <div className="space-y-2">
            <Input.TextArea
              rows={6}
              placeholder="Example: Generate an OpenAPI 3.0 JSON document for listing users..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-3">
          <Button onClick={handleCancel}>Cancel</Button>
          {status === 'define' && (
            currentNode?.type === 'CLIENT' && !aiInputVisible ? (
              activeKey === '1' ? (
                <Button
                  type="primary"
                  onClick={() => setActiveKey('2')}
                >
                  Save
                </Button>
              ) : (
                <Button type="primary" onClick={() => handleSubmit(currentNode)}>
                  Confirm
                </Button>
              )
            ) : (
              <Button type="primary" onClick={() => handleSubmit(currentNode)}>
                Confirm
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
