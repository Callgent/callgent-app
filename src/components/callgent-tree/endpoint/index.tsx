import { useEffect, useRef, useState } from 'react'
import { Input, Button, InputRef, Tabs, Modal } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import useTreeActionStore, { useTreeActions } from '@/models/callgentTreeStore'
import { postEndpointsApi, putCallgentApi } from '@/api/services/callgentService'
import { convertToOpenAPI, restoreDataFromOpenApi } from '@/utils/callgent-tree'
import { categorizeNodes, injectDefaults } from './util'
import Payload from './payload'
import Mapping from './mapping'

export default function EndpointPage() {
  const {
    endpointName,
    whatFor,
    how2Ops,
    formData,
    editId,
    setEditId,
    clear
  } = useEndpointStore()

  const { currentNode, callgentTree, } = useTreeActionStore()
  const { closeModal } = useTreeActions()

  // 受控页签 key，'1' = Define，'2' = Implement
  const [activeKey, setActiveKey] = useState<'1' | '2'>('1')

  // AI generation states
  const [aiInputVisible, setAiInputVisible] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // 点击 Next，跳到下一页签；如果已是最后一页，可执行提交或禁用按钮
  const handleNext = () => {
    if (activeKey === '1') {
      setActiveKey('2')
    }
  }

  // Output all data on confirm
  const handleConfirm = async () => {
    const param = categorizeNodes({ children: formData.parameters })
    const data = convertToOpenAPI({
      path: endpointName,
      operationId: endpointName,
      endpointConfig: formData.endpoint || {},
      whatFor,
      params: {
        parameters: param.data || {},
        requestBody: formData.requestBody || {}
      },
      responses: formData.responses,
      how2Ops,
    })
    const apiMapping = (currentNode?.type === 'CLIENT' && formData?.apiMap?.api_id) ? {
      api_id: formData.apiMap.api_id,
      params: {
        parameters: formData.apiMap.parameters || {},
        requestBody: injectDefaults(formData.apiMap.api_data.params.requestBody, formData.apiMap.requestBody) || {}
      },
      responses: injectDefaults(formData.apiMap.api_data.responses, formData.apiMap.responses) || {}
    } : null
    const request = { ...restoreDataFromOpenApi(data), apiMapping, entryId: currentNode?.id, callgentId: callgentTree[0]?.id }
    if (editId) {
      putCallgentApi(editId, request).then(() => {
        setEditId(null)
      })
    } else {
      await postEndpointsApi(request)
    }
  }

  // Reset all states on cancel
  const handleCancel = () => {
    Modal.confirm({
      title: '确认切换EP？',
      content: '所有未保存的更改将会丢失，是否确定取消？',
      okText: '确认',
      cancelText: '返回',
      centered: true,
      onOk() {
        clear()
        closeModal()
        setActiveKey('1')
      }
    });
  }

  const inputRef = useRef<InputRef>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="w-full mr-4">
      <div className="mx-auto rounded-lg p-6 space-y-6 border-2 border-gray-300 dark:border-gray-600">
        <div className="flex justify-between">
          <h2 className="text-3xl font-semibold font-sans">Functional Endpoint</h2>
          <button
            className="text-blue-600"
            onClick={() => setAiInputVisible(!aiInputVisible)}
          >
            AI Generate
          </button>
        </div>

        {/* 如果是 CLIENT 且不显示 AI 输入，则展示两个“页签”，但隐藏标签栏 */}
        {(!aiInputVisible && currentNode?.type === 'CLIENT') ? (
          <Tabs
            activeKey={activeKey}
            items={[
              { key: '1', label: 'Define', children: <Payload />, disabled: true },
              { key: '2', label: 'Implement', children: <Mapping />, disabled: true },
            ]}
          />
        ) : (<Payload />)}

        {aiInputVisible && (
          <div className="space-y-2">
            <Input.TextArea
              rows={6}
              placeholder="Example: Generate an OpenAPI 3.0 JSON document for listing users, with pagination and filtering support"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          <Button onClick={handleCancel}>Cancel</Button>
          {/* 如果有下一页签，显示 Next 按钮，否则显示 Confirm */}
          {currentNode?.type === 'CLIENT' && !aiInputVisible ? (
            activeKey === '1' ? (
              <Button type="primary" onClick={handleNext}>
                Save
              </Button>
            ) : (
              <Button type="primary" onClick={handleConfirm}>
                Confirm
              </Button>
            )
          ) : (
            <Button type="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
