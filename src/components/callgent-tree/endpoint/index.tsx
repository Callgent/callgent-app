import { useEffect, useState } from 'react'
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

  const {
    setFormData1,
    setFormData2,
    parameters,
    requestBody,
    responses,
    clearSchemaTreeStore,
    formData1,
    setParameters,
    setRequestBody,
    setResponses,
  } = useSchemaTreeStore()

  // 点击 Next，跳到下一页签；如果已是最后一页，可执行保存或确认
  const handleNext = (key: '1' | '2') => {
    if (key === '2') {
      setFormData({
        ...formData,
        parameters,
        requestBody,
        responses,
      })
      setFormData1({ parameters, requestBody, responses })
    } else {
      setFormData2({ parameters, requestBody, responses })
      // 恢复之前的 define 数据
      setTimeout(() => {
        setParameters(formData1?.parameters)
        setRequestBody(formData1?.requestBody)
        setFormData({
          ...formData,
          metaExe: {
            ...formData?.metaExe,
            parameters,
            requestBody,
          },
        })
      }, 10)
    }
    // 保证 responses 在下一次渲染时更新
    setTimeout(() => {
      setResponses(responses)
    }, 10)
    setActiveKey(key)
  }

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
              onChange={key => handleNext(key as '1' | '2')}
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
                  onClick={() => handleNext('2')}
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
