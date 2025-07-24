import React, { useEffect, useState } from 'react'
import TreeNode from './tree-node'
import SchemaDetailModal from './edit-modal'
import { addSchemaChild, categorizeNodes } from './utils'
import { Button } from 'antd'
import { useSchemaTreeStore } from './store'

interface JSONSchemaEditorProps {
    mode: 1 | 2 | 3
    schemaType: 'params' | 'responses'
}

export default function JSONSchemaEditor({
    mode,
    schemaType
}: JSONSchemaEditorProps) {
    // 
    const { params, defResponses, setParameters, setRequestBody, setResponses } = useSchemaTreeStore();
    const submitSchema = (nodes: any) => {
        const { data, body } = categorizeNodes(nodes)
        if (schemaType === 'params') {
            setParameters(data)
            setRequestBody(body)
        } else {
            setResponses(body)
        }
    }
    // 根节点（虚拟）
    const initialData = { id: 'root', name: '', type: 'object', required: false, in: 'body' }
    const [tree, setTree] = useState<any>({ ...initialData, children: schemaType === 'params' ? params : defResponses })
    useEffect(() => {
        const newChildren = schemaType === 'params' ? params : defResponses
        setTree((prev: any) => ({ ...prev, children: newChildren }))
        submitSchema({ id: 'root', name: '', type: 'object', required: false, in: 'body', children: newChildren })
    }, [params, defResponses])
    // collapsedIds 存放“被折叠”的节点

    // 弹窗状态
    const [detailId, setDetailId] = useState<string | null>(null)
    const [detailData, setDetailData] = useState<any | null>(null)

    // collapsedIds 同理，只在挂载时根据初始 tree 计算一次
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
        const all = new Set<string>()
        const collect = (n: any) => {
            if ((n.type === 'object' && n.children?.length) || (n.type === 'array' && n.item)) {
                all.add(n.id)
                if (n.children) n.children.forEach(collect)
                if (n.item) collect(n.item)
            }
        }
        tree.children?.forEach(collect)
        // mode=1 全部折叠，2/3 全部展开
        return mode === 1 ? all : new Set()
    })

    // 切换单个节点折叠/展开
    const toggleCollapse = (id: string) => {
        setCollapsedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    // 增/删/改 & 提交逻辑
    const addChild = (parentId: string) => {
        if (mode === 1) return
        setTree(addSchemaChild(tree, parentId))
    }

    const updateNode = (id: string, partial: any) => {
        const walk = (n: any): any => {
            if (n.id === id) {
                const isTypeChangeToArray = partial?.type === 'array';
                const updated = { ...n, ...partial };
                if (isTypeChangeToArray) {
                    const defaultItem = {
                        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        name: 'item-1',
                        type: 'string',
                        required: false,
                        in: 'body',
                    };
                    updated.item = { ...defaultItem, name: 'item' };
                    updated.children = [defaultItem];
                }
                return updated;
            }
            if (n.children) {
                return { ...n, children: n.children.map(walk) };
            }
            if (n.item) {
                return { ...n, item: walk(n.item) };
            }
            return n;
        };
        const newTree = walk(tree);
        setTree(newTree);
        submitSchema(newTree);
    };


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
        const findWithParent = (n: any, parent: any = null): { node: any; parent: any } | null => {
            if (n.id === id) return { node: n, parent }
            if (n.children) {
                for (const c of n.children) {
                    const res = findWithParent(c, n)
                    if (res) return res
                }
            }
            if (n.item) {
                const res = findWithParent(n.item, n)
                if (res) return res
            }
            return null
        }
        const result = findWithParent(tree)
        if (result) {
            const { node, parent } = result
            const cleanParent = parent
                ? {
                    ...parent,
                    children: undefined,
                    item: undefined,
                }
                : undefined
            setDetailData({ ...node, __parent: cleanParent })
            setDetailId(id)
        }
    }

    const saveDetail = (vals: any) => {
        if (detailId) updateNode(detailId, vals)
        setDetailId(null)
    }

    // 渲染：子节点是否渲染由 !collapsedIds.has(n.id) 决定
    const renderTree = (nodes: any[], depth = 0): React.ReactNode =>
        nodes.map(n => (
            <React.Fragment key={n.id}>
                <TreeNode
                    node={n}
                    depth={depth}
                    mode={mode}
                    collapsed={collapsedIds.has(n.id)}
                    toggleCollapse={() => toggleCollapse(n.id)}
                    updateNode={updateNode}
                    addChild={addChild}
                    openDetail={openDetail}
                    deleteNode={deleteNode}
                />
                {
                    n.children &&
                    !collapsedIds.has(n.id) &&
                    ['object', 'array'].includes(n.type) &&
                    renderTree(n.children, depth + 1)
                }
            </React.Fragment>
        ))


    return (
        <div className="px-2 w-full">
            <div className="overflow-auto bg-white rounded mb-2 w-full">
                {tree.children && renderTree(tree.children)}
            </div>
            {mode === 2 && (
                <Button
                    className="mb-2 w-full text-center py-2 border border-dashed border-gray-400 rounded-md text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                    onClick={() => addChild('root')}
                >
                    + Add
                </Button>
            )}
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
