// tree-node.tsx
import React, { useState } from 'react'
import { Input, Button, Popover, Tag, Popconfirm, Mentions } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { generateId, typeOptions } from './utils'
import { useSchemaTreeStore } from './store'

interface TreeNodeProps {
  node: any
  parent?: any
  depth: number
  mode: 1 | 2 | 3
  collapsed: boolean
  schemaType: 'params' | 'responses'
  toggleCollapse: () => void
  updateNode: (id: string, partial: any) => void
  addChild: (parentId: string) => void
  openDetail: (id: string) => void
  deleteNode: (id: string) => void
}

export default function TreeNode({
  node,
  parent,
  depth,
  mode,
  collapsed,
  schemaType,
  toggleCollapse,
  updateNode,
  addChild,
  openDetail,
  deleteNode,
}: TreeNodeProps) {
  const indent = depth * 16

  const finishNameEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const v = (e.target as HTMLInputElement).value.trim()
    if (v) updateNode(node.id, { name: v, editingName: false })
    else deleteNode(node.id)
  }

  const onBlurNameInput = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = e.target.value.trim()
    if (v) updateNode(node.id, { name: v, editingName: false })
    else deleteNode(node.id)
  }
  const { paramsOptions, responsesOptions } = useSchemaTreeStore();
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)

  return (
    <div className={`group pl-2 mt-1 p-1 border border-gray-300 rounded select-none`}
      style={{ marginLeft: indent }}
    >
      <div className="group flex items-center justify-between">
        <div className="flex items-center">
          {/* 折叠/展开 控制 */}
          {['object', 'array'].includes(node.type) ? (
            collapsed ? (
              <RightOutlined onClick={toggleCollapse} />
            ) : (
              <DownOutlined onClick={toggleCollapse} />
            )
          ) : (
            <span className="inline-block w-4" />
          )}

          {/* 名称 编辑 */}
          {mode === 2 && node.editingName && !['array'].includes(parent?.type) ? (
            <Input
              className="w-32 mr-2"
              defaultValue={node.name}
              autoFocus
              onPressEnter={finishNameEdit}
              onBlur={onBlurNameInput}
            />
          ) : (
            <div
              className={`w-32 mr-2 ${mode !== 1 ? 'cursor-pointer' : 'text-gray-500'} flex space-x-2`}
              onClick={() => {
                mode === 2 && updateNode(node.id, { editingName: true });
                mode === 3 && toggleCollapse();
              }}
            >
              <div>{node.name || "点击输入名称"}</div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* 新增子节点 */}
          {mode === 2 && (['object', 'array'].includes(node.type)) && (
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined className="p-1 border rounded" />}
              onClick={() => addChild(node.id)}
              className="mr-2"
            />
          )}
          {mode === 3 && node.type === 'array' && (
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined className="p-1 border rounded" />}
              onClick={() => addChild(node.id)}
              className="mr-2"
            />
          )}

          {/* 类型切换 */}
          {mode === 2 ? (
            <Popover
              open={typePopoverOpen}
              onOpenChange={setTypePopoverOpen}
              content={typeOptions.map(t => (
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
                    setTypePopoverOpen(false);
                  }}
                >
                  {t}
                </div>
              ))}
              trigger="click"
            >
              <Tag className="cursor-pointer mr-2 w-14 text-center">{node.type}</Tag>
            </Popover>
          ) : (
            <Tag className="mr-2 w-14 text-center">{node.type}</Tag>
          )}

          {/* 必填切换 */}
          {mode === 2 ? (
            <Tag
              onClick={() => updateNode(node.id, { required: !node.required })}
              className="cursor-pointer mr-2 w-14 text-center"
            >
              {node.required ? '必填' : '非必填'}
            </Tag>
          ) : (
            <Tag className="mr-2 w-14 text-center">{node.required ? '必填' : '非必填'}</Tag>
          )}

          {/* 删除 */}
          {mode === 2 && (
            <Popconfirm
              title="确认删除这个节点？"
              description="删除后该节点及其子节点将无法恢复"
              onConfirm={() => deleteNode(node.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                size="small"
                type="text"
                disabled={['array'].includes(parent?.type)}
                icon={<DeleteOutlined className="text-red-500 p-1 border rounded" />}
                className="mr-2"
              />
            </Popconfirm>
          )}

          {/* 详情编辑 */}
          {(mode === 2) && (
            <Button
              size="small"
              type="text"
              disabled={['array'].includes(parent?.type)}
              icon={<EditOutlined className="p-1 border rounded" />}
              onClick={() => openDetail(node.id)}
            />
          )}
        </div>
      </div>
      <div>
        {mode === 3 && (!['array'].includes(node?.parentType) || !['object'].includes(node?.type)) && (
          <div style={{ marginLeft: indent }} className='mt-1'>
            <Mentions
              prefix="{{"
              placeholder="Type {{ to mention…"
              defaultValue={node.default}
              onChange={(value) => { updateNode(node.id, { default: value }) }}
              options={schemaType === 'params' ? paramsOptions : responsesOptions}
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  )
}
