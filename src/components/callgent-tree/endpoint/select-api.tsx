import { useEffect, useState } from 'react'
import { TreeSelect, Spin, message } from 'antd'
import { getCallgentApi, getCallgentApiList } from '@/api/services/callgentService'
import { useLocation } from 'react-router'
import { useEndpointStore } from '@/models/endpoint'

import {
  convertEndpointsToTreeNodes,
  convertSentriesToTreeNodes,
  updateTreeNode
} from '@/utils/callgent-tree'
import ApiMap from './api-map'
import { extractFirst2xxJsonSchema } from './util'

export default function EndpointSelectApi() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const callgentId = query.get('callgentId') || ''
  const { setFormData, formData, status } = useEndpointStore()

  const [treeData, setTreeData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
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
      const sentryNodes = convertSentriesToTreeNodes(sentries).map((item: any) => ({ ...item, selectable: false }))
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
      const sentryNodes = convertSentriesToTreeNodes(sentries).map((item: any) => ({ ...item, selectable: false }))
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
      const { data } = await getCallgentApi(value);
      setCurrentApi(data)
      setFormData({ ...formData, apiMap: { api_id: data.id, api_data: data, } })
    } catch (err) {
      message.error('Failed to load API parameters')
    }
  }

  return (
    <div className="py-4">
      <Spin spinning={loading}>
        <TreeSelect
          className="w-full"
          treeData={treeData}
          loadData={onLoadData}
          onSelect={handleApiSelect}
          placeholder="Select an API"
          treeDefaultExpandAll={false}
          defaultValue={formData?.apiMap?.api_data?.name || null}
          allowClear
          showSearch
          disabled={status === 'read_only'}
        />
        <ApiMap data={currentApi?.params || formData?.apiMap?.api_data.params || {}}
          responses={extractFirst2xxJsonSchema(currentApi?.responses || formData?.apiMap?.api_data?.responses)}
        />
      </Spin>
    </div>
  )
}
