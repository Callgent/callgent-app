import React, { useEffect, useState, useCallback, useMemo } from 'react'
import TreeNode from './tree-node'
import SchemaDetailModal from './edit-modal'
import {
    addSchemaChild,
    deleteNode,
    extractFirst2xxJsonSchema,
    getParams,
    jsonSchemaToTreeNode,
    treeNodeToJsonSchema,
    updateNode,
} from './utils'
import { Button } from 'antd'
import { useSchemaTreeStore } from './store'

interface JSONSchemaEditorProps {
    mode: 1 | 2 | 3
    schemaType: 'requestBody' | 'parameters' | 'responses'
}

interface TreeNodeData {
    id: string
    name: string
    type: string
    required: boolean
    in?: string
    children?: TreeNodeData[]
    item?: TreeNodeData
    editingName?: boolean
    [key: string]: any
}

export default function JSONSchemaEditor({ mode, schemaType }: JSONSchemaEditorProps) {
    const {
        setParameters,
        setRequestBody,
        setResponses,
        setIsEdit,
        isEdit,
        formData1,
        formData2,
        selectApi,
        setParamsOptions,
        setResponsesOptions
    } = useSchemaTreeStore()

    // 整个 schema 树
    const [tree, setTree] = useState<TreeNodeData>({
        id: 'root',
        name: '',
        type: 'object',
        required: false,
        in: 'query',
        children: [],
    })

    // 折叠状态
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

    // 详情弹窗
    const [detail, setDetail] = useState<{
        id: string
        data: TreeNodeData & { __parent?: Partial<TreeNodeData> }
    } | null>(null)

    // 提交函数，提取 params 或 responses
    const submitSchema = useCallback(
        (nodes: TreeNodeData) => {
            switch (schemaType) {
                case "parameters":
                    setParameters(nodes.children)
                    break
                case "requestBody":
                    setRequestBody(nodes.children)
                    break
                case "responses":
                    setResponses(nodes.children)
                    break
            }
        },
        [schemaType, setParameters, setRequestBody, setResponses]
    )

    // 初始化 & 同步 tree、store
    useEffect(() => {
        let children: TreeNodeData[] = []
        if (mode === 1) {
            children = formData1[schemaType] || []
            if (schemaType === 'responses') {
                children = jsonSchemaToTreeNode(extractFirst2xxJsonSchema(selectApi.responses))?.children || []
            }
            setTree((t) => ({ ...t, children }))
        } else if (mode === 2) {
            children = formData1[schemaType] || []
            setTree((t) => ({ ...t, children }))
            submitSchema({ ...tree, children })
        } else if (mode === 3) {
            children = formData2[schemaType] || []
            if (schemaType === 'responses') {
                children = formData1[schemaType]
            }
            setTree((t) => ({ ...t, children }))
            submitSchema({ ...tree, children })
        }
        if (mode === 3 && selectApi) {
            const paramTree = {
                id: 'root',
                name: '',
                type: 'object',
                required: false,
                in: 'query',
                children: getParams(formData1),
            }
            setParamsOptions(treeNodeToJsonSchema(paramTree) || {})
            setResponsesOptions(extractFirst2xxJsonSchema(selectApi.responses) || {})
        }
        // 首次展开前就折叠所有 object/array
        setCollapsedIds(
            new Set(
                children.flatMap((n) => {
                    const ids: string[] = []
                    const dfs = (node: any) => {
                        if (
                            (node.type === 'object' || node.type === 'array') &&
                            node.children?.length
                        ) {
                            ids.push(node.id)
                            node.children.forEach(dfs)
                        }
                    }
                    dfs(n)
                    return ids
                })
            )
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, schemaType, formData1, formData2])

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
            setTree((t) => addSchemaChild(t, parentId))
        },
        [mode]
    )

    // 回调：更新节点
    const updateNode_ = useCallback(
        (id: string, partial: Partial<TreeNodeData>) => {
            if (!isEdit) setIsEdit(true)
            setTree((t) => {
                const updated = updateNode(t, id, partial)
                submitSchema(updated)
                return updated
            })
        },
        [isEdit, setIsEdit, submitSchema]
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
            // 深度优先查找节点及其父节点
            const findWithParent = (
                node: TreeNodeData,
                parent?: TreeNodeData
            ): { node: TreeNodeData; parent?: TreeNodeData } | null => {
                if (node.id === id) return { node, parent }
                for (const child of node.children || []) {
                    const res = findWithParent(child, node)
                    if (res) return res
                }
                if (node.item) {
                    const res = findWithParent(node.item, node)
                    if (res) return res
                }
                return null
            }
            const res = findWithParent(tree)
            if (res) {
                const { node, parent } = res
                setDetail({
                    id,
                    data: {
                        ...node,
                        __parent: parent
                            ? { id: parent.id, name: parent.name, type: parent.type }
                            : undefined,
                    },
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
            }>(({ nodes, depth = 0 }) =>
                nodes.map((n) => (
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
                        />
                        {n.children &&
                            !collapsedIds.has(n.id) &&
                            ['object', 'array'].includes(n.type) && (
                                <SchemaTree nodes={n.children} depth={depth + 1} />
                            )}
                    </React.Fragment>
                ))
            ),
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
                {tree.children && <SchemaTree nodes={tree.children} />}
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