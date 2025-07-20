import { useEffect, useState } from 'react'
import { TreeSelect, Spin, message } from 'antd'
import { getEndpointApi, getCallgentApiList } from '@/api/services/callgentService'
import { useLocation } from 'react-router'
import { useEndpointStore } from '@/models/endpoint'

import {
  convertEndpointsToTreeNodes,
  convertSentriesToTreeNodes,
  updateTreeNode
} from '@/utils/callgent-tree'
import ApiMap from './api-map'
import { extractFirst2xxJsonSchema } from './util'

export default function EndpointSelectApi({ refs }: { refs: { parametersRef: any, requestBodyRef: any, responsesRef: any } }) {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const callgentId = query.get('callgentId') || ''
  const { setFormData, formData, status } = useEndpointStore()

  const [treeData, setTreeData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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
      setFormData({ ...formData, entry: data?.endpoints[0]?.entry })
      setTreeData(newTreeData)
    } catch (err) {
      message.error('Failed to load child nodes')
    }
  }

  // Handle API selection and load parameters
  const handleApiSelect = async (value: string, node: any) => {
    if (!node?.fullData) return
    try {
      const { data } = await getEndpointApi(value);
      setFormData({ ...formData, metaExe: { apiMap: { epName: data.name, api_data: data } } })
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
          defaultValue={formData?.metaExe?.api_data?.name || null}
          allowClear
          showSearch
          disabled={status === 'read_only'}
        />
        <ApiMap data={formData?.metaExe?.apiMap?.api_data?.params || {}}
          refs={refs}
          apiResponses={extractFirst2xxJsonSchema(formData?.metaExe?.apiMap?.api_data?.responses)}
        />
      </Spin>
    </div>
  )
}
