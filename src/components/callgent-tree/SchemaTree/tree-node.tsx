// tree-node.tsx
import React from 'react'
import { Input, Button, Popover, Tag, Popconfirm, Mentions } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { generateId } from '../endpoint/util'

interface TreeNodeProps {
  node: any
  depth: number
  mode: 1 | 2 | 3
  expanded: boolean
  toggleExpand: () => void
  updateNode: (id: string, partial: any) => void
  addChild: (parentId: string) => void
  openDetail: (id: string) => void
  deleteNode: (id: string) => void
}

const typeOptions = ['string', 'number', 'boolean', 'object', 'array']

export default function TreeNode({
  node,
  depth,
  mode,
  expanded,
  toggleExpand,
  updateNode,
  addChild,
  openDetail,
  deleteNode,
}: TreeNodeProps) {
  const indent = depth * 16

  const finishNameEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const v = (e.target as HTMLInputElement).value.trim()
    if (v) updateNode(node.id, { name: v, editingName: false })
  }

  return (
    <>
      <div
        className="group pl-2 mt-1 p-1 flex items-center justify-between border border-gray-300 rounded select-none"
        style={{ marginLeft: indent }}
      >
        <div className="flex items-center">
          {/* 折叠/展开 控制 */}
          {['object', 'array'].includes(node.type) ? (
            expanded ? (
              <DownOutlined onClick={toggleExpand} className="mr-1 cursor-pointer" />
            ) : (
              <RightOutlined onClick={toggleExpand} className="mr-1 cursor-pointer" />
            )
          ) : (
            <span className="inline-block w-4 mr-1" />
          )}

          {/* 名称 编辑 */}
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
              className={`w-32 mr-2 ${mode === 2 ? 'cursor-pointer' : 'text-gray-500'}`}
              onClick={() => mode === 2 && updateNode(node.id, { editingName: true })}
            >
              {node.name || <em className="text-gray-400">点击输入名称</em>}
            </div>
          )}
        </div>

        <div className="flex items-center">
          {/* 新增子节点 */}
          {mode === 2 && (node.type === 'object' || node.type === 'array') && (
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
                icon={<DeleteOutlined className="text-red-500 p-1 border rounded" />}
                className="mr-2"
              />
            </Popconfirm>
          )}

          {/* 详情编辑 */}
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
      {(!['object', "array"].includes(node.type) && mode === 3) && (
        <div className='py-1' style={{ marginLeft: indent }}>
          <Mentions
            prefix="{{"
            placeholder="Type {{ to mention…"
            value={node.default}
            onChange={(e) => updateNode(node.id, { default: e })}
            options={[]}
            rows={3}
          />
        </div>
      )}
    </>
  )
}
