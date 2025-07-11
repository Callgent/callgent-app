export type NodeType = 'string' | 'number' | 'boolean' | 'object' | 'array'
export type ParamIn = 'query' | 'path' | 'header' | 'body'

export interface SchemaNode {
    id: string
    name: string
    editingName: boolean
    type: NodeType
    required: boolean
    in: ParamIn
    default?: any
    description?: string
    children?: SchemaNode[]
    item?: SchemaNode
}

export interface JSONSchemaEditorProps {
    mode: 1 | 2 | 3
    schemaType: 'responses' | 'params'
}