import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Input, Button, InputRef, Tabs } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import EndpointModal from './modal'
import useTreeActionStore, { useTreeActions } from '@/models/callgentTreeStore'
import { postEndpointsApi } from '@/api/services/callgentService'
import { convertToOpenAPI, restoreDataFromOpenApi } from '@/utils/callgent-tree'
import EndpointSelectApi from './select-api'
import PayloadCom from './payload'
import { extractFirst2xxJsonSchema, injectDefaults } from './util'

export default function EndpointPage() {
  const {
    endpointName,
    parameters,
    responses,
    whatFor,
    how2Ops,
    formData,
    setIsEndpointOpen,
    setParameters,
    setResponses,
    setWhatFor,
    setEndpointName,
    setHow2Ops,
  } = useEndpointStore()

  const { currentNode, callgentTree, } = useTreeActionStore()
  const { closeModal } = useTreeActions()

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
    const apiMapping = {
      api_id: formData.apiMap.api_id,
      params: {
        parameters: injectDefaults(formData.apiMap.api_data.params.parameters, formData.apiMap.parameters) || {},
        requestBody: injectDefaults(formData.apiMap.api_data.params.requestBody, formData.apiMap.requestBody) || {}
      },
      responses: injectDefaults(extractFirst2xxJsonSchema(formData.apiMap.api_data.responses), formData.apiMap.responses) || {}
    }
    await postEndpointsApi({ ...restoreDataFromOpenApi(data), apiMapping, entryId: currentNode?.id, callgentId: callgentTree[0]?.id });
  }

  // Reset all states on cancel
  const handleCancel = () => {
    setEndpointName('')
    setWhatFor('')
    setHow2Ops('')
    setParameters([])
    setResponses([])
    closeModal()
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
              <div className="font-medium bg-gray-50 px-4 py-2">
                Payload
              </div>
              <div className="divide-y divide-gray-100 border-t">
                <PayloadCom data={parameters} onSubmit={(data: any) => setParameters(data)} />
              </div>
            </div>

            {/* Responses */}
            <div className="border border-gray-200 rounded">
              <div className="font-medium bg-gray-50 px-4 py-2">
                Responses
              </div>
              <div className="divide-y divide-gray-100">
                <PayloadCom data={responses} onSubmit={(data: any) => setResponses(data)} mode='response' />
              </div>
            </div>

            {/* how2Ops textarea */}
            <div>
              <Tabs defaultActiveKey="1" items={[
                {
                  key: '1',
                  label: 'how2Ops',
                  children: (<div>
                    <Input.TextArea
                      rows={3}
                      value={how2Ops}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onChange={(e) => setHow2Ops(e.target.value)}
                    />
                  </div>),
                },
                {
                  key: '2',
                  label: 'Api Map',
                  children: <EndpointSelectApi />,
                },
              ]} />

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
