import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Input,
  Button,
  Popover,
  Tag,
  Popconfirm,
  Mentions,
  Form,
  Modal,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { treeToSchema, typeOptions } from './utils'
import { useEndpointStore } from '@/models/endpoint'

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
  setFormData: any
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
  setFormData
}: TreeNodeProps) {
  const indent = depth * 16
  const { paramsOptions, responsesOptions } = useEndpointStore()
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
        payload.children = [{
          id: `${node.id}_item_1`,
          name: 'item',
          editingName: false,
          type: 'string',
          required: false,
          in: 'query',
        }]
      updateNode(node.id, payload)
      setTypePopoverOpen(false)
    },
    [node.id, updateNode]
  )

  // 切换必填
  const onToggleRequired = useCallback(() => {
    updateNode(node.id, { required: !node.required })
  }, [node.id, node.required, updateNode])

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
            if (mode === 2 && !['array'].includes(node?.parentType)) updateNode(node.id, { editingName: true })
            if (mode === 3) onToggle()
          }}
        >
          {node.name || '点击输入名称'}
        </div>
        {node.required && <div style={{ color: 'red', cursor: 'pointer' }} className='w-3 text-center' onClick={mode === 2 ? onToggleRequired : undefined} title='是否必填？'>*</div>}
        {!node.required && mode === 2 && <div className='w-3 h-3 border-2 border-gray-500 cursor-pointer rounded-sm' onClick={onToggleRequired} title='是否必填？'></div>}
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

  const { schemaData } = useEndpointStore()
  const { setParamsOptions, setResponsesOptions } = useEndpointStore()
  useEffect(() => {
    const { parameters = [], requestBody = [], responses2 = [] } = schemaData;
    setParamsOptions(treeToSchema([...parameters, ...requestBody]) || {})
    setResponsesOptions(treeToSchema([...parameters, ...requestBody, ...responses2]) || {})
  }, [schemaData])

  const [open, setOpen] = useState(false);
  const showModal = () => setOpen(true);
  const handleCancel = () => setOpen(false);

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
        <div className='pr-4 max-w-xs flex-1 flex justify-start'>
          {mode === 2 && (
            <div className="flex w-full">
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
                  className="text-gray-600 cursor-pointer border-b border-dashed border-transparent hover:border-gray-400 truncate w-full"
                  onClick={() => updateNode(node.id, { editingDescription: true })}
                  title={node.description}
                >
                  {node.description || '添加描述...'}
                </div>
              )}
            </div>
          )}
          {mode === 3 && (
            <div className="flex w-full">
              {node.editingDefault ? (
                <Input
                  size="small"
                  autoFocus
                  defaultValue={node.default}
                  placeholder={node.description}
                  className="border-0 border-b border-gray-300 focus:border-blue-500 focus:shadow-none rounded-none"
                  onBlur={(e) => {
                    updateNode(node.id, {
                      default: (e.target as HTMLInputElement).value,
                      editingDefault: false,
                    })
                  }}
                  onPressEnter={(e) => {
                    updateNode(node.id, {
                      default: (e.target as HTMLInputElement).value,
                      editingDefault: false,
                    })
                  }}
                />
              ) : (
                <div
                  className="text-gray-600 cursor-pointer border-b border-dashed border-transparent hover:border-gray-400 truncate w-full"
                  onClick={() => updateNode(node.id, { editingDefault: true })}
                  title={node.default}
                >
                  {node.default || '设置默认值...'}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {JSON.stringify(node.items)}
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
          {mode === 3 && parentType !== 'array' && (
            <Button
              size="small"
              type="text"
              icon={<EditOutlined className="p-1 border rounded" />}
              onClick={showModal}
            />
          )}
        </div>
      </div>
      {/* mode=3 时显示默认值 Mentions */}
      <Modal
        title="提示"
        open={open}
        onCancel={handleCancel}
        centered
        footer={null}
        width={800}
      >
        <div style={{ marginLeft: indent }} className="mt-1">
          <Form.Item name={[node.id, node.name]} initialValue={node?.default}>
            <Mentions
              prefix="{{"
              placeholder="Type {{ to mention…"
              onBlur={(e) => {
                setFormData({ id: node.id, name: 'default', value: (e.target as HTMLTextAreaElement).value });
                updateNode(node.id, { default: (e.target as HTMLTextAreaElement).value })
              }}
              options={schemaType !== "responses" ? paramsOptions : responsesOptions}
              rows={15}
            />
          </Form.Item>
        </div>
      </Modal>
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
