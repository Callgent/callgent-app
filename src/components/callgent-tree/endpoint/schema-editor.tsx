import React, { useEffect, useState } from 'react'
import TreeNode from './tree-node'
import SchemaDetailModal from './edit-modal'
import type { JSONSchemaEditorProps, SchemaNode } from './type'
import { addSchemaChild, categorizeNodes, jsonSchemaToTreeNode } from './util'
import { useEndpointStore } from '@/models/endpoint'
import { Button } from 'antd'

// 1 = 只读模式，只能查看；2 = 定义模式，可新增/删除/修改所有信息；3 = 实现模式，仅可编辑 default
// params/responses
export default function JSONSchemaEditor({ mode, schemaType, }: JSONSchemaEditorProps) {
  // 初始根节点
  const [tree, setTree] = useState<SchemaNode>({
    id: 'root',
    name: '',
    editingName: false,
    type: 'object',
    required: false,
    in: 'body',
    children: [],
  })
  const { formData, parameters, setFormData, responses, status } = useEndpointStore()

  useEffect(() => {
    if (schemaType === 'params' && mode === 2) {
      setTree(prev => ({ ...prev, children: parameters }))
    } else if (schemaType === 'responses' && mode === 2) {
      setTree(prev => ({ ...prev, children: responses }))
    } else if (schemaType === 'params' && mode === 1 && formData?.parameters) {
      setTree(prev => ({ ...prev, children: [...formData?.parameters, ...(jsonSchemaToTreeNode(formData?.requestBody)?.children as [])] }))
    } else if (schemaType === 'responses' && mode === 1 && formData?.responses) {
      setTree(prev => ({ ...prev, children: jsonSchemaToTreeNode(formData?.responses)?.children }))
    }
  }, [parameters])
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<SchemaNode | null>(null)

  const addChild = (parentId: string) => {
    if (mode !== 2) return
    setTree(addSchemaChild(tree, parentId))
  }
  const updateNode = (id: string, partial: Partial<SchemaNode>) => {
    const walk = (n: SchemaNode): SchemaNode => {
      if (n.id === id) return { ...n, ...partial }
      if (n.children) return { ...n, children: n.children.map(walk) }
      if (n.item) return { ...n, item: walk(n.item) }
      return n
    }
    const newTree = walk(tree)
    setTree(newTree)
    submitSchema(newTree)
  }
  const deleteNode = (id: string) => {
    if (mode !== 2) return
    const walk = (n: SchemaNode): SchemaNode => {
      if (n.children) {
        n.children = n.children.filter(c => c.id !== id).map(walk)
      }
      if (n.item?.id === id) {
        n.item = undefined
      } else if (n.item) {
        n.item = walk(n.item)
      }
      return { ...n }
    }
    const newTree = walk(tree)
    setTree(newTree)
    submitSchema(newTree)
  }
  const openDetail = (id: string) => {
    if (mode === 1) return
    const find = (n: SchemaNode): SchemaNode | null => {
      if (n.id === id) return n
      if (n.children) {
        for (const c of n.children) {
          const r = find(c)
          if (r) return r
        }
      }
      if (n.item) return find(n.item)
      return null
    }
    const node = find(tree)!
    setDetailData(node)
    setDetailId(id)
  }
  const saveDetail = (values: Partial<SchemaNode>) => {
    if (detailId) updateNode(detailId, values)
    setDetailId(null)
  }
  const submitSchema = (nodes: SchemaNode) => {
    const { data, body } = categorizeNodes(nodes)
    if (schemaType === 'params') {
      setFormData({ ...formData, parameters: data, requestBody: body })
    } else {
      setFormData({ ...formData, responses: body })
    }
  }

  const renderTree = (nodes: SchemaNode[], depth = 0): React.ReactNode =>
    nodes.map(n => (
      <React.Fragment key={n.id}>
        <TreeNode
          node={n}
          depth={depth}
          mode={mode}
          schemaType={schemaType}
          updateNode={updateNode}
          addChild={addChild}
          openDetail={openDetail}
          deleteNode={deleteNode}
        />
        {n.type === 'object' && n.children && renderTree(n.children, depth + 1)}
        {n.type === 'array' && n.item && (
          <>
            <TreeNode
              node={n.item}
              depth={depth + 1}
              mode={mode}
              schemaType={schemaType}
              updateNode={updateNode}
              addChild={addChild}
              openDetail={openDetail}
              deleteNode={deleteNode}
            />
            {n.item.type === 'object' &&
              n.item.children &&
              renderTree(n.item.children, depth + 2)}
          </>
        )}
      </React.Fragment>
    ))

  return (
    <div className="px-2 w-full">
      <div
        className="overflow-auto bg-white rounded mb-2 w-full"
        style={{ maxHeight: 600 }}
      >
        {tree.children ? renderTree(tree.children) : null}
      </div>
      {/* 顶层新增 */}
      <Button
        className="mb-2 w-full text-center py-2 border border-dashed border-gray-400 rounded-md text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
        onClick={() => addChild('root')}
        disabled={status === 'read_only' || mode === 1}
      >
        + Add
      </Button>
      {/* 详情弹窗 */}
      {detailData && detailId && (
        <SchemaDetailModal
          visible={!!detailId}
          mode={mode}
          schemaType={schemaType}
          onCancel={() => setDetailId(null)}
          initialValues={detailData}
          onOk={saveDetail}
        />
      )}
    </div>
  )
}
