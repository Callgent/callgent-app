import { useEffect, useRef, useState } from 'react'
import { Input, Button, InputRef, Tabs } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import EndpointModal from './modal'
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
    console.log(formData.responses);

    const responses = categorizeNodes({ children: formData?.responses?.length ? formData.responses : [] }).body;
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
      responses: responses,
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
      await postEndpointsApi(request);
    }
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

        {(!aiInputVisible && currentNode?.type === 'CLIENT') ? (
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Define',
              children: <Payload />,
            },
            {
              key: '2',
              label: 'Implement',
              children: <Mapping />,
            },
          ]} />
        ) : <Payload />}
        <div className="mt-4 flex justify-end space-x-3">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
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
