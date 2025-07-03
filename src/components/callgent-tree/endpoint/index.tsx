import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Input, Tag, Button, InputRef } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import EndpointModal from './modal'
import { convertToOpenAPI } from './util'
import useTreeActionStore from '@/models/callgentTreeStore'
import { postEndpointsApi } from '@/api/services/callgentService'
import { restoreDataFromOpenApi } from '@/utils/callgent-tree'

export default function EndpointPage() {
  const {
    endpointName,
    parameters,
    responses,
    whatFor,
    how2Ops,
    formData,
    setIsParameterOpen,
    setIsResponseOpen,
    setIsEndpointOpen,
    setParameters,
    setResponses,
    setWhatFor,
    setEndpointName,
    setHow2Ops,
    setEditIndex,
    setEditType,
    setFormData,
    addParameter,
    addResponse,
  } = useEndpointStore()

  const { currentNode, callgentTree } = useTreeActionStore()

  // AI generation states
  const [aiInputVisible, setAiInputVisible] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Output all data on confirm
  const handleConfirm = async () => {
    const data = convertToOpenAPI({
      path: endpointName,
      operationId: endpointName,
      endpointConfig: formData.endpoint || {},
      whatFor,
      parameters,
      responses,
      how2Ops,
    })
    await postEndpointsApi({ ...restoreDataFromOpenApi(data), entryId: currentNode?.id, callgentId: callgentTree[0]?.id });
  }

  // Reset all states on cancel
  const handleCancel = () => {
    setEndpointName('')
    setWhatFor('')
    setHow2Ops('')
    setParameters([])
    setResponses([])
  }

  // AI request logic
  const handleAiGenerate = async () => {
    setIsLoading(true)
    try {
      // TODO: implement AI generation request
    } catch (err) {
      console.error('AI request failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Input for new parameter and response
  const [paramName, setParamName] = useState('')
  const subParamName = () => {
    if (!paramName.trim()) return
    addParameter({ name: paramName.trim(), method: 'body', type: 'string' })
    setParamName('')
  }

  const [response, setResponse] = useState('')
  const subResponse = () => {
    if (!response.trim()) return
    addResponse({ name: response.trim(), type: 'object' })
    setResponse('')
  }
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  return (
    <div className="w-full mr-4">
      <div className="mx-auto rounded-lg p-6 space-y-6 border-2">
        <div className="flex justify-between">
          <h2 className="text-3xl font-semibold font-sans">Functional Endpoint</h2>
          <button
            className="text-blue-600"
            onClick={() => setAiInputVisible(!aiInputVisible)}
          >
            AI Generate
          </button>
        </div>
        {!aiInputVisible && (
          <>
            {/* Endpoint name and setting */}
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                defaultValue="mysite"
                value={endpointName}
                onChange={(e) => setEndpointName(e.target.value)}
                placeholder="Please enter endpoint name starting with /"

              />
              <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors duration-300" onClick={() => setIsEndpointOpen(true)}>
                <Icon icon="solar:settings-bold" className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">whatFor</label>
              <Input.TextArea rows={2} value={whatFor} onChange={(e) => setWhatFor(e.target.value)} />
            </div>

            {/* Parameters */}
            <div className="border border-gray-200 rounded">
              <div className="flex justify-between items-center bg-gray-50 px-4 py-2">
                <span className="font-medium">Payload</span>
                <button
                  onClick={() => setIsParameterOpen(true)}
                  className="flex items-center gap-1 text-blue-600 hover:bg-gray-200 px -2 rounded"
                >
                  <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              <div className="divide-y divide-gray-100 border-t">
                {parameters.map((param, index) => (
                  <div key={index} className="flex justify-between px-4 py-3 items-center">
                    <div>{param.name}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {param.default && <Tag color="green">{param.default}</Tag>}
                      <Tag color="blue">{param.type}</Tag>
                      <button
                        onClick={() => {
                          setEditIndex(index)
                          setEditType('parameter')
                          setFormData({ ...formData, parameter: param })
                          setIsParameterOpen(true)
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 items-center hover:bg-gray-100">
                  <div className="border hover:border-gray-300 rounded-md cursor-pointer transition-colors duration-300">
                    <Input
                      placeholder="Parameter name"
                      bordered={false}
                      value={paramName}
                      onChange={(e) => setParamName(e.target.value)}
                      onPressEnter={subParamName}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag color="blue">string</Tag>
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={subParamName}
                    >
                      <Icon icon="mdi:content-save" className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="border border-gray-200 rounded">
              <div className="flex justify-between items-center bg-gray-50 px-4 py-2">
                <span className="font-medium">Responses</span>
                <button
                  onClick={() => setIsResponseOpen(true)}
                  className="flex items-center gap-1 text-blue-600"
                >
                  <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {responses.map((res, index) => (
                  <div key={index} className="flex justify-between px-4 py-3 items-center">
                    <div>{res.name}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {res.default && <Tag color="green">{res.default}</Tag>}
                      <Tag color="blue">{res.type}</Tag>
                      <button
                        onClick={() => {
                          setEditIndex(index)
                          setEditType('response')
                          setFormData({ ...formData, response: res })
                          setIsResponseOpen(true)
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 items-center hover:bg-gray-100">
                  <div className="border hover:border-gray-300 rounded-md cursor-pointer transition-colors duration-300">
                    <Input
                      placeholder="Response name"
                      bordered={false}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      onPressEnter={subResponse}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag color="blue">string</Tag>
                    <button className="text-blue-500 hover:text-blue-700" onClick={subResponse}>
                      <Icon icon="mdi:content-save" className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* how2Ops textarea */}
            <div>
              <label className="block text-sm font-medium mb-1">how2Ops</label>
              <Input.TextArea
                rows={3}
                value={how2Ops}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setHow2Ops(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex justify-end space-x-3">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </>
        )}

        {/* AI input area */}
        {aiInputVisible && (
          <div className="space-y-2">
            <Input.TextArea
              rows={6}
              placeholder="Example: Generate an OpenAPI 3.0 JSON document for listing users, with pagination and filtering support"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="primary" loading={isLoading} onClick={handleAiGenerate}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>
      <EndpointModal />
    </div>
  )
}
