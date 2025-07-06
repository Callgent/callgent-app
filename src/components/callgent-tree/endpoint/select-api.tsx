import { useEffect, useState } from 'react'
import { TreeSelect, Form, Spin, message } from 'antd'
import { getCallgentApi, getCallgentApiList } from '@/api/services/callgentService'
import { useLocation } from 'react-router'
import { useEndpointStore } from '@/models/endpoint'

import {
  convertEndpointsToTreeNodes,
  convertSentriesToTreeNodes,
  parseOpenApiParams,
  updateTreeNode
} from '@/utils/callgent-tree'
import ApiMap from './api-map'

export default function EndpointSelectApi() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const callgentId = query.get('callgentId') || ''

  const [formApi] = Form.useForm()
  const { getDefaultValue, setDefaultValue, setFormData, formData } = useEndpointStore()

  const [treeData, setTreeData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApiId, setSelectedApiId] = useState<string | undefined>(undefined)
  const [currentApi, setCurrentApi] = useState<any | null>(null)

  // Initialize top-level nodes
  const init = async () => {
    if (!callgentId) return
    setLoading(true)
    try {
      const { data } = await getCallgentApiList(callgentId)
      const endpoints = data.endpoints || []
      const sentries = data.sentries || []
      const endpointNodes = convertEndpointsToTreeNodes(endpoints)
      const sentryNodes = convertSentriesToTreeNodes(sentries)
      setTreeData([...endpointNodes, ...sentryNodes])
    } catch (err) {
      message.error('Failed to initialize')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    init()
  }, [callgentId])

  // Load sentry children on expand
  const onLoadData = async (treeNode: any) => {
    if (treeNode.children?.length > 0) return
    const callgentId = treeNode.callgentIds?.[0]
    if (!callgentId) return

    try {
      const { data } = await getCallgentApiList(`${callgentId}^${treeNode.host}`)
      const endpoints = data.endpoints || []
      const sentries = data.sentries || []

      const endpointNodes = convertEndpointsToTreeNodes(endpoints)
      const sentryNodes = convertSentriesToTreeNodes(sentries)

      const newTreeData = updateTreeNode(treeData, treeNode.key, [...sentryNodes, ...endpointNodes])
      setTreeData(newTreeData)
    } catch (err) {
      message.error('Failed to load child nodes')
    }
  }

  // Handle API selection and load parameters
  const handleApiSelect = async (value: string, node: any) => {
    if (!node?.fullData) return

    try {
      const { data } = await getCallgentApi(value)
      const api = node.fullData

      const result = parseOpenApiParams(data.params || {})

      setSelectedApiId(value)
      setCurrentApi({
        ...api,
        parameter: result
      })

      result.forEach((param: any) => {
        const existing = getDefaultValue(api.name, param.name)
        const defaultVal = existing !== '' ? existing : param.default ?? ''
        setDefaultValue(api.name, param.name, defaultVal)
      })
    } catch (err) {
      message.error('Failed to load API parameters')
    }
  }

  // Sync form change to store
  const handleFormChange = () => {
    const values = formApi.getFieldsValue()
    if (!selectedApiId) return
    setFormData({ ...formData, apiMap: values })
  }

  return (
    <div className="py-4 space-y-4">
      <Spin spinning={loading}>
        <Form
          form={formApi}
          onChange={handleFormChange}
          initialValues={formData.apiMap}
        >
          <Form.Item name="api_id" rules={[{ required: true, message: 'Please select an API' }]}>
            <TreeSelect
              className="w-full"
              treeData={treeData}
              loadData={onLoadData}
              onSelect={handleApiSelect}
              placeholder="Select an API"
              treeDefaultExpandAll={false}
              allowClear
              showSearch
            />
          </Form.Item>
          {currentApi?.parameter?.length > 0 && (
            <div className="divide-y divide-gray-100 border rounded">
              <ApiMap data={currentApi.parameter} onSubmit={(data: any) => { setCurrentApi({ ...currentApi, parameter: data }); setFormData({ ...formData, apiMap: { ...formData?.apiMap, parameter: data } }) }} />
            </div>
          )}
        </Form>
      </Spin>
    </div>
  )
}
