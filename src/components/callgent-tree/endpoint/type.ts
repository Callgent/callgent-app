// types.ts（或者单独的类型文件）
export type NodeType = 'string' | 'number' | 'boolean' | 'object' | 'array'
export type ParamIn = 'query' | 'path' | 'header' | 'body'

export interface SchemaNode {
    id: string
    name: string
    editingName: boolean
    type: NodeType
    required: boolean
    in: ParamIn          // 这里in是必需的，确保所有children都包含这个字段
    default?: any
    description?: string
    children?: SchemaNode[]
    item?: SchemaNode
}
