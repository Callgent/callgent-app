import React, { useEffect, useState, useCallback, useMemo } from 'react'
import TreeNode from './schema-node'
import SchemaDetailModal from './schema-modal'
import { addSchemaChild, deleteNode, findNodeWithParent, getNestedNodeIds, updateNode } from './utils'
import { Button, Form } from 'antd'
import type { SchemaEditorProps, TreeNodeData } from './types'

function JSONSchemaEditor({ schema, mode, schemaType, submitSchema, setFormData }: SchemaEditorProps) {
    const [tree, setTree] = useState<TreeNodeData>({ id: 'root', name: '', type: 'object', required: false, in: 'query', children: [], })

    // 折叠状态
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

    // 详情弹窗
    const [detail, setDetail] = useState<{
        id: string
        data: TreeNodeData & { __parent?: Partial<TreeNodeData> }
    } | null>(null)

    // 初始化 & 同步 tree、store
    useEffect(() => {
        let children: TreeNodeData[] = schema || []
        if (mode !== 2 && schemaType === "responses") {
            children = [
                {
                    id: 'root_response',
                    name: 'response',
                    type: 'object',
                    required: false,
                    in: 'query',
                    default: '',
                    children: children,
                },
            ];
        }
        setTree((t) => ({ ...t, children }))
        // 首次展开前就折叠所有 object/array
        setCollapsedIds(getNestedNodeIds(children))
    }, [schema])

    // 回调：折叠/展开
    const toggleCollapse = useCallback((id: string) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev)
            prev.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    // 回调：新增子节点
    const addChild = useCallback(
        (parentId: string) => {
            setTree((t) => {
                const addSchema = addSchemaChild(t, parentId)
                submitSchema(addSchema)
                return addSchema
            })
        },
        [mode]
    )

    // 回调：更新节点
    const updateNode_ = useCallback(
        (id: string, partial: Partial<TreeNodeData>) => {
            setTree((t) => {
                const updated = updateNode(t, id, partial)
                submitSchema(updated)
                return updated
            })
        },
        [submitSchema]
    )

    // 回调：删除节点
    const deleteNode_ = useCallback(
        (id: string) => {
            setTree((t) => {
                const updated = deleteNode(t, id)
                submitSchema(updated)
                return updated
            })
        },
        [mode, submitSchema]
    )

    // 回调：打开详情
    const openDetail = useCallback(
        (id: string) => {
            const result = findNodeWithParent(tree, id)
            if (result) {
                const { node, parent } = result
                setDetail({
                    id,
                    data: { ...node, __parent: parent }
                })
            }
        },
        [tree]
    )

    // 回调：保存详情
    const saveDetail = useCallback(
        (vals: Partial<TreeNodeData>) => {
            if (detail) {
                updateNode_(detail.id, vals)
                setDetail(null)
            }
        },
        [detail, updateNode_]
    )

    // 渲染树状结构的组件，memo 化，减少重复渲染
    const SchemaTree = useMemo(
        () =>
            React.memo<{
                nodes: TreeNodeData[]
                depth?: number
            }>(({ nodes, depth = 0 }) => {
                // 在 mode 不为 2 时进行排序：必填在前，非必填在后
                const sortedNodes = mode !== 2
                    ? [...nodes].sort((a, b) => {
                        if (a.required && !b.required) return -1;
                        if (!a.required && b.required) return 1;
                        return 0;
                    })
                    : nodes;
                return sortedNodes.map((n) => (
                    <React.Fragment key={n.id}>
                        <TreeNode
                            node={n}
                            depth={depth}
                            mode={mode}
                            schemaType={schemaType}
                            collapsed={collapsedIds.has(n.id)}
                            toggleCollapse={() => toggleCollapse(n.id)}
                            updateNode={updateNode_}
                            addChild={addChild}
                            openDetail={openDetail}
                            deleteNode={deleteNode_}
                            setFormData={setFormData}
                        />
                        {n.children &&
                            !collapsedIds.has(n.id) &&
                            ['object', 'array'].includes(n.type) && (
                                <SchemaTree nodes={n.children} depth={depth + 1} />
                            )}
                    </React.Fragment>
                ));
            }),
        [
            mode,
            schemaType,
            collapsedIds,
            toggleCollapse,
            updateNode_,
            addChild,
            openDetail,
            deleteNode_,
        ]
    )

    return (
        <div className="px-2 w-full">
            <div className="overflow-auto bg-white rounded mb-2 w-full">
                <Form>{tree.children && <SchemaTree nodes={tree.children} />}</Form>
            </div>

            {mode === 2 && (
                <Button
                    className="mb-2 w-full text-center py-2 border border-dashed border-gray-400 rounded-md text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                    onClick={() => addChild('root')}
                >
                    + Add
                </Button>
            )}

            {detail && (
                <SchemaDetailModal
                    visible
                    mode={mode}
                    schemaType={schemaType}
                    initialValues={detail.data}
                    onCancel={() => setDetail(null)}
                    onOk={saveDetail}
                />
            )}
        </div>
    )
}

export default React.memo(JSONSchemaEditor, (prev, next) => {
    return (prev.schema === next.schema)
})
