import React, { useState, useEffect } from 'react'
import TreeNode from './tree-node'
import SchemaDetailModal from './edit-modal'
import { Button } from 'antd'
import { addSchemaChild, categorizeNodes } from '../endpoint/util'
import { useEndpointStore } from '@/models/endpoint'

interface JSONSchemaEditorProps {
    mode: 1 | 2 | 3
    schemaType: 'params' | 'responses'
    schema: any[]
    handleSubmit?: (result: any) => void
}

export default function SchemaEditor({
    mode,
    schemaType,
    schema,
    handleSubmit,
}: JSONSchemaEditorProps) {
    // 根节点（虚拟）
    const [tree, setTree] = useState<any>({
        id: 'root',
        name: '',
        type: 'object',
        required: false,
        in: 'body',
        children: schema,
    })

    // 保存哪些节点是展开状态
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    // 弹窗状态
    const [detailId, setDetailId] = useState<string | null>(null)
    const [detailData, setDetailData] = useState<any | null>(null)

    // 外部 schema 变化时同步，并根据 mode 初始化 expandedIds
    useEffect(() => {
        setTree({
            id: 'root',
            name: '',
            type: 'object',
            required: false,
            in: 'body',
            children: schema,
        })

        // 收集所有可展开节点 id（object 或 array）
        const collect = (n: any, set: Set<string>) => {
            if ((n.type === 'object' && n.children?.length) || (n.type === 'array' && n.item)) {
                set.add(n.id)
                if (n.children) n.children.forEach((c: any) => collect(c, set))
                if (n.item) collect(n.item, set)
            }
        }
        const all = new Set<string>()
        tree.children?.forEach((n: any) => collect(n, all))
        // mode=2 默认展开，其他模式默认折叠
        setExpandedIds(mode === 2 ? all : new Set())
    }, [schema, mode])

    // 切换单个节点展开/折叠
    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    // 同前：增/删/改 & 提交逻辑
    const addChild = (parentId: string) => {
        if (mode !== 2) return
        setTree(addSchemaChild(tree, parentId))
    }
    const updateNode = (id: string, partial: any) => {
        const walk = (n: any): any => {
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
        const walk = (n: any): any => {
            if (n.children) {
                n.children = n.children.filter((c: any) => c.id !== id).map(walk)
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
        const find = (n: any): any | null => {
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
    const saveDetail = (vals: any) => {
        if (detailId) updateNode(detailId, vals)
        setDetailId(null)
    }

    const { setStatus } = useEndpointStore()
    const submitSchema = (nodes: any) => {
        setStatus('edit')
        if (!handleSubmit) return
        const { data, body } = categorizeNodes(nodes)
        if (schemaType === 'params') handleSubmit({ parameters: data, requestBody: body })
        else handleSubmit({ responses: body })
    }

    // 渲染：是否渲染子节点由 expandedIds 决定
    const renderTree = (nodes: any[], depth = 0): React.ReactNode =>
        nodes.map(n => (
            <React.Fragment key={n.id}>
                <TreeNode
                    node={n}
                    depth={depth}
                    mode={mode}
                    expanded={expandedIds.has(n.id)}
                    toggleExpand={() => toggleExpand(n.id)}
                    updateNode={updateNode}
                    addChild={addChild}
                    openDetail={openDetail}
                    deleteNode={deleteNode}
                />
                {expandedIds.has(n.id) && n.type === 'object' && n.children && renderTree(n.children, depth + 1)}
                {expandedIds.has(n.id) && n.type === 'array' && n.item && (
                    <>
                        <TreeNode
                            node={n.item}
                            depth={depth + 1}
                            mode={mode}
                            expanded={expandedIds.has(n.item.id)}
                            toggleExpand={() => toggleExpand(n.item.id)}
                            updateNode={updateNode}
                            addChild={addChild}
                            openDetail={openDetail}
                            deleteNode={deleteNode}
                        />
                        {expandedIds.has(n.item.id) && n.item.type === 'object' && n.item.children && renderTree(n.item.children, depth + 2)}
                    </>
                )}
            </React.Fragment>
        ))

    return (
        <div className="px-2 w-full">
            <div className="overflow-auto bg-white rounded mb-2 w-full" style={{ maxHeight: 600 }}>
                {tree.children && renderTree(tree.children)}
            </div>

            <Button
                className="mb-2 w-full text-center py-2 border border-dashed border-gray-400 rounded-md text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                onClick={() => addChild('root')}
                disabled={mode === 1}
            >
                + Add
            </Button>

            {detailData && detailId && (
                <SchemaDetailModal
                    visible
                    mode={mode}
                    schemaType={schemaType}
                    initialValues={detailData}
                    onCancel={() => setDetailId(null)}
                    onOk={saveDetail}
                />
            )}
        </div>
    )
}
