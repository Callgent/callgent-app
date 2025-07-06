import { useState } from 'react'
import { Input } from 'antd'
import { updateNode } from '@/utils/callgent-tree'

export default function ApiMap({
  data = [],
  onSubmit
}: {
  data?: any[]
  onSubmit?: (tree: any[]) => void
}) {
  const [treeData, setTreeData] = useState<any[]>(data)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<string>('')

  const submitEdit = (key: string) => {
    const newData = updateNode(treeData, key, {
      prompt: editingPrompt
    })
    setTreeData(newData)
    onSubmit?.(newData)
    setEditingKey(null)
  }

  const renderNode = (node: any, level = 0) => {
    const isEditing = editingKey === node.key
    return (
      <div
        key={node.key}
        className="flex items-center pl-4 py-1 hover:bg-gray-100 rounded text-sm"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {/* 字段名 */}
        <div className="font-semibold w-32">{node.name}</div>

        {/* 提示词 */}
        <div className="">
          {isEditing ? (
            <Input
              size="small"
              value={editingPrompt}
              onChange={(e) => setEditingPrompt(e.target.value)}
              onPressEnter={() => submitEdit(node.key)}
              onBlur={() => submitEdit(node.key)}
              autoFocus
              className="w-full"
              placeholder="请输入提示词"
            />
          ) : (
            <div
              className="text-gray-600 cursor-pointer truncate"
              onClick={() => {
                setEditingKey(node.key)
                setEditingPrompt(node.prompt || '')
              }}
            >
              {node.prompt || <span className="text-gray-400">点击添加提示词</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full text-sm font-mono px-2 pb-2 space-y-1">
      {treeData.map((node: any) => renderNode(node))}
    </div>
  )
}
