import React, { useState, useCallback, useMemo } from 'react'
import {
  Input,
  Button,
  Popover,
  Tag,
  Popconfirm,
  Mentions,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { generateId, typeOptions } from './utils'
import { useSchemaTreeStore } from './store'

interface TreeNodeProps {
  node: any
  parentType?: string
  depth: number
  mode: 1 | 2 | 3
  schemaType: 'requestBody' | 'parameters' | 'responses'
  collapsed: boolean
  toggleCollapse: (id: string) => void
  updateNode: (id: string, partial: Partial<any>) => void
  addChild: (parentId: string) => void
  openDetail: (id: string) => void
  deleteNode: (id: string) => void
}

function TreeNodeInner({
  node,
  parentType,
  depth,
  mode,
  schemaType,
  collapsed,
  toggleCollapse,
  updateNode,
  addChild,
  openDetail,
  deleteNode,
}: TreeNodeProps) {
  const indent = depth * 16
  const { paramsOptions, responsesOptions } = useSchemaTreeStore()
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)

  // 名称编辑完成处理
  const finishNameEdit = useCallback(
    (value: string) => {
      const v = value.trim()
      if (v) updateNode(node.id, { name: v, editingName: false })
      else deleteNode(node.id)
    },
    [node.id, updateNode, deleteNode]
  )

  // 切换折叠
  const onToggle = useCallback(() => {
    toggleCollapse(node.id)
  }, [node.id, toggleCollapse])

  // 新增子节点
  const onAddChild = useCallback(() => {
    addChild(node.id)
  }, [node.id, addChild])

  // 删除节点
  const onDelete = useCallback(() => deleteNode(node.id), [
    node.id,
    deleteNode,
  ])

  // 打开详情
  const onOpenDetail = useCallback(() => openDetail(node.id), [
    node.id,
    openDetail,
  ])

  // 切换类型
  const onTypeSelect = useCallback(
    (t: string) => {
      const payload: Partial<any> = {
        type: t,
      }
      if (t === 'object') payload.children = []
      if (t === 'array')
        payload.item = {
          id: generateId(),
          name: 'item',
          editingName: true,
          type: 'string',
          required: false,
          in: 'query',
        }
      updateNode(node.id, payload)
      setTypePopoverOpen(false)
    },
    [node.id, updateNode]
  )

  // 切换必填
  const onToggleRequired = useCallback(() => {
    updateNode(node.id, { required: !node.required })
  }, [node.id, node.required, updateNode])

  // 默认值变更（mode=3）
  const onDefaultChange = useCallback(
    (value: string) => {
      updateNode(node.id, { default: value })
    },
    [node.id, updateNode]
  )

  // 渲染名称或编辑框
  const NameField = useMemo(() => {
    if (mode === 2 && node.editingName && parentType !== 'array') {
      return (
        <Input
          className="w-32 mr-2"
          defaultValue={node.name}
          autoFocus
          onPressEnter={(e) =>
            finishNameEdit((e.target as HTMLInputElement).value)
          }
          onBlur={(e) => finishNameEdit((e.target as HTMLInputElement).value)}
        />
      )
    }
    return (
      <div className='flex items-center'>
        <div
          className={`mr-2 ${mode === 1 ? 'text-gray-500' : 'cursor-pointer'
            } flex`}
          onClick={() => {
            if (mode === 2) updateNode(node.id, { editingName: true })
            if (mode === 3) onToggle()
          }}
        >
          {node.name || '点击输入名称'}
        </div>
        {node.required && <div style={{ color: 'red', cursor: 'pointer' }} className='w-3 text-center' onClick={mode === 2 ? onToggleRequired : undefined} title='是否必填？'>*</div>}
        {!node.required && mode === 2 && <div className='w-3 h-3 border-2 border-gray-500 cursor-pointer rounded-sm' onClick={onToggleRequired} title='是否必填？'></div>}
        {mode === 2 && (
          <div className="w-32 mx-2 flex">
            {node.editingDescription ? (
              <Input
                size="small"
                autoFocus
                defaultValue={node.description}
                placeholder="请输入描述"
                className="border-0 border-b border-gray-300 focus:border-blue-500 focus:shadow-none rounded-none"
                onBlur={(e) => {
                  updateNode(node.id, {
                    description: (e.target as HTMLInputElement).value,
                    editingDescription: false,
                  })
                }}
                onPressEnter={(e) => {
                  updateNode(node.id, {
                    description: (e.target as HTMLInputElement).value,
                    editingDescription: false,
                  })
                }}
              />
            ) : (
              <div
                className="text-gray-600 cursor-pointer border-b border-dashed border-transparent hover:border-gray-400 truncate w-32"
                onClick={() => updateNode(node.id, { editingDescription: true })}
                title={node.description}
              >
                {node.description || '添加描述...'}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }, [
    mode,
    node.name,
    node.editingName,
    parentType,
    finishNameEdit,
    updateNode,
    onToggle,
  ])

  return (
    <div
      className="group pl-2 mt-1 p-1 border border-gray-300 rounded select-none"
      style={{ marginLeft: indent }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* 折叠/展开 图标 */}
          {['object', 'array'].includes(node.type) ? (
            collapsed ? (
              <RightOutlined onClick={onToggle} />
            ) : (
              <DownOutlined onClick={onToggle} />
            )
          ) : (
            <span className="inline-block w-4" />
          )}
          {/* 名称 */}
          <div>{NameField}</div>
        </div>

        <div className="flex items-center space-x-2">
          {((mode === 2 && ['object'].includes(node.type)) || (mode === 3 && ['array'].includes(node.type)) || ((mode === 2 && node.children?.length === 0))) && (
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined className="p-1 border rounded" />}
              onClick={onAddChild}
            />
          )}

          {(mode === 2 || (['array'].includes(node?.parentType))) && (
            <Popconfirm
              title="确认删除这个节点？"
              onConfirm={onDelete}
              okText="确认"
              cancelText="取消"
            >
              <Button
                size="small"
                type="text"
                disabled={parentType === 'array'}
                icon={
                  <DeleteOutlined className="text-red-500 p-1 border rounded" />
                }
              />
            </Popconfirm>
          )}
          <div></div>
          {/* 类型切换 */}
          {mode === 2 ? (
            <Popover
              open={typePopoverOpen}
              onOpenChange={setTypePopoverOpen}
              content={typeOptions.map((t) => (
                <div
                  key={t}
                  className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                  onClick={() => onTypeSelect(t)}
                >
                  {t}
                </div>
              ))}
              trigger="click"
            >
              <Tag className="cursor-pointer mr-2 w-14 text-center">
                {node.type}
              </Tag>
            </Popover>
          ) : (
            <Tag className="mr-2 w-14 text-center">{node.type}</Tag>
          )}
          {/* 详情编辑 */}
          {mode === 2 && parentType !== 'array' && (
            <Button
              size="small"
              type="text"
              icon={<EditOutlined className="p-1 border rounded" />}
              onClick={onOpenDetail}
            />
          )}
        </div>
      </div>

      {/* mode=3 时显示默认值 Mentions */}
      {mode === 3 && (
        <div style={{ marginLeft: indent }} className="mt-1">
          <Mentions
            prefix="{{"
            placeholder="Type {{ to mention…"
            defaultValue={node.default}
            onBlur={(e) =>
              onDefaultChange((e.target as HTMLTextAreaElement).value)
            }
            options={schemaType !== "responses" ? paramsOptions : responsesOptions}
            rows={2}
          />
        </div>
      )}
    </div>
  )
}

export default React.memo(TreeNodeInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.collapsed === next.collapsed &&
    prev.depth === next.depth &&
    prev.mode === next.mode
  )
})
