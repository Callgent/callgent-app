import { useEffect, useRef, useState } from 'react'
import { Input, Button, InputRef, Tabs, Modal } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import useTreeActionStore, { useTreeActions } from '@/models/callgentTreeStore'
import Payload from './payload'
import Mapping from './mapping'

export default function EndpointPage() {
  const {
    status,
    endpointName,
    formData,
    handleConfirm,
    clear,
    setFormData
  } = useEndpointStore()

  const { currentNode } = useTreeActionStore()
  const { closeModal } = useTreeActions()


  // 受控页签 key，'1' = Define，'2' = Implement
  const [activeKey, setActiveKey] = useState('1')

  // AI generation states
  const [aiInputVisible, setAiInputVisible] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // 点击 Next，跳到下一页签；如果已是最后一页，可执行提交或禁用按钮
  const handleNext = () => {
    if (activeKey === '1') {
      setActiveKey('2')
    }
  }

  // Reset all states on cancel
  const handleCancel = () => {
    if (status === 'edit') { return close() }
    Modal.confirm({
      title: '确认关闭？',
      content: '所有未保存的更改将会丢失，是否确定取消？',
      okText: '确认',
      cancelText: '返回',
      okButtonProps: {
        className: 'bg-primary text-white border-none'
      },
      centered: true,
      onOk() { close() }
    });
  }
  const close = () => {
    clear()
    closeModal()
    setActiveKey('1')
  }

  const inputRef = useRef<InputRef>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const parametersRef = useRef<any>(null);
  const requestBodyRef = useRef<any>(null);
  const responsesRef = useRef<any>(null);
  const handleSubmit = (currentNode: any) => {
    setFormData({
      ...formData,
      metaExe: {
        ...formData?.metaExe,
        'parameters': parametersRef.current?.state?.formData,
        'requestBody': requestBodyRef.current?.state?.formData,
        'responsesApiOne': responsesRef.current?.state?.formData,
      }
    })
    setTimeout(() => {
      handleConfirm(currentNode)
    }, 50);
  }
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
        {!aiInputVisible ?
          (
            <>
              {(currentNode?.type === 'CLIENT') ? (
                <Tabs
                  activeKey={activeKey}
                  onChange={(e: string) => setActiveKey(e)}
                  items={[
                    { key: '1', label: 'Define', children: <Payload />, disabled: false },
                    { key: '2', label: 'Implement', children: <Mapping refs={{ parametersRef, requestBodyRef, responsesRef }} />, disabled: false },
                  ]}
                />
              ) : (<Payload />)}
            </>
          )
          :
          (
            <div className="space-y-2">
              <Input.TextArea
                rows={6}
                placeholder="Example: Generate an OpenAPI 3.0 JSON document for listing users, with pagination and filtering support"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
          )
        }

        <div className="mt-4 flex justify-end space-x-3">
          <Button onClick={handleCancel}>Cancel</Button>
          {status === 'define' && (
            currentNode?.type === 'CLIENT' && !aiInputVisible ? (
              activeKey === '1' ? (
                <Button type="primary" onClick={handleNext} disabled={endpointName ? false : true}>
                  Save
                </Button>
              ) : (
                <Button type="primary" onClick={() => handleSubmit(currentNode)}>
                  Confirm
                </Button>
              )
            ) : (
              <Button type="primary" onClick={() => handleConfirm(currentNode)}>
                Confirm
              </Button>
            )
          )}

        </div>
      </div>
    </div >
  )
}
