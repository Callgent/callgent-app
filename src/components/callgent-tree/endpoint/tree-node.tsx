// tree-node.tsx
import React, { useState } from 'react'
import { Input, Button, Popover, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { SchemaNode, NodeType } from './type'
import { generateId } from './util'

interface TreeNodeProps {
  node: SchemaNode
  depth: number
  mode: 1 | 2 | 3
  schemaType: string
  updateNode: (id: string, partial: Partial<SchemaNode>) => void
  addChild: (parentId: string) => void
  openDetail: (id: string) => void
  deleteNode: (id: string) => void
}

const typeOptions: NodeType[] = ['string', 'number', 'boolean', 'object', 'array',]

export default function TreeNode({
  node,
  depth,
  mode,
  updateNode,
  addChild,
  openDetail,
  deleteNode,
}: TreeNodeProps) {
  const indent = depth * 16
  const [popVisible, setPopVisible] = useState(false)

  const finishNameEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const newName = (e.target as HTMLInputElement).value.trim()
    if (!newName) {
      return
    }
    updateNode(node.id, { name: newName, editingName: false })
  }

  return (
    <div
      className="group pl-2 mt-1 p-1 flex items-center justify-between border border-gray-300 rounded"
      style={{ marginLeft: indent }}
    >
      {/* 名称 */}
      <div>
        {mode === 2 && node.editingName ? (
          <Input
            className="w-32 mr-2"
            defaultValue={node.name}
            autoFocus
            onPressEnter={finishNameEdit}
            onBlur={() => updateNode(node.id, { editingName: false })}
          />
        ) : (
          <div
            className={`w-32 mr-2 ${mode === 2 ? 'cursor-pointer' : 'text-gray-500'
              }`}
            onClick={() =>
              mode === 2 && updateNode(node.id, { editingName: true })
            }
          >
            {node.name || <em className="text-gray-400">点击输入名称</em>}
          </div>
        )}
      </div>

      <div className="flex items-center">
        {/* 新增子节点（仅定义模式） */}
        {mode === 2 && (node.type === 'object' || node.type === 'array') && (
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined className="p-1 border rounded" />}
            onClick={() => addChild(node.id)}
            className="mr-2"
          />
        )}

        {/* 删除（仅定义模式） */}
        {mode === 2 && (
          <Button
            size="small"
            type="text"
            icon={<DeleteOutlined className="text-red-500 p-1 border rounded" />}
            onClick={() => deleteNode(node.id)}
            className="mr-2"
          />
        )}

        {/* 类型切换（仅定义模式） */}
        {mode === 2 && (
          <Popover
            content={
              <div className="space-y-1">
                {typeOptions.map(t => (
                  <div
                    key={t}
                    className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      updateNode(node.id, {
                        type: t,
                        children: t === 'object' ? [] : undefined,
                        item:
                          t === 'array'
                            ? {
                              id: generateId(),
                              name: 'item',
                              editingName: true,
                              type: 'string',
                              required: false,
                              in: 'body',
                            }
                            : undefined,
                      })
                      setPopVisible(false)
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            }
            trigger="click"
            open={popVisible}
            onOpenChange={setPopVisible}
            placement="right"
          >
            <Tag className="cursor-pointer mr-2">{node.type}</Tag>
          </Popover>
        )}
        {(mode !== 2) && <Tag className="mr-2">{node.type}</Tag>}

        {/* 必填切换（定义模式） */}
        {mode === 2 ? (
          <Tag
            onClick={() =>
              updateNode(node.id, { required: !node.required })
            }
            className="cursor-pointer mr-2"
          >
            {node.required ? '必填' : '非必填'}
          </Tag>
        ) : (
          <Tag className="mr-2">{node.required ? '必填' : '非必填'}</Tag>
        )}

        {/* 详情编辑（定义/实现模式） */}
        {(mode === 2 || mode === 3) && (
          <Button
            size="small"
            type="text"
            icon={<EditOutlined className="p-1 border rounded" />}
            onClick={() => openDetail(node.id)}
          />
        )}
      </div>
    </div>
  )
}
