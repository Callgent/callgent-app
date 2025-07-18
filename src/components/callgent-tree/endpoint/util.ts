// Request methods
export const requestMethods = [
  { value: 'GET', description: 'Retrieve data' },
  { value: 'POST', description: 'Create new data' },
  { value: 'PUT', description: 'Update/replace data' },
  { value: 'PATCH', description: 'Partially update data' },
  { value: 'DELETE', description: 'Remove data' },
  { value: 'HEAD', description: 'Get metadata (no body)' },
  { value: 'OPTIONS', description: 'List allowed methods' },
  { value: 'CONNECT', description: 'Establish tunnel connection' },
  { value: 'TRACE', description: 'Echoes request (debugging)' },
]

export const requestLocations = [
  { label: 'Query (URL query parameters)', value: 'query' },
  { label: 'Path (path parameters)', value: 'path' },
  { label: 'Header (request headers)', value: 'header' },
  { label: 'Cookie (HTTP cookies)', value: 'cookie' },
  { label: 'Body (request body)', value: 'body' },
  { label: 'Form (application/x-www-form-urlencoded)', value: 'form' },
  { label: 'Multipart (multipart/form-data)', value: 'multipart' },
]

// Field types (fixed options)
export const fieldTypes = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'object', value: 'object' },
  { label: 'array', value: 'array' },
];

import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import type { SchemaNode } from './type';
// parameters转schema
export const getSchema = (data: any) => {
  const parameters = data || []
  const parameters_schema: any = {
    type: 'object',
    properties: {},
    required: []
  }
  for (const param of parameters) {
    const originalSchema = param.schema
    let jsonSchema = openapiSchemaToJsonSchema(originalSchema)
    jsonSchema.in = param.in || null
    jsonSchema.required = param.in || true
    jsonSchema.schema = param.schema || {}
    if (param.description) {
      jsonSchema.description = param.description || null
    }
    parameters_schema.properties[param.name] = jsonSchema
    if (param.required) {
      parameters_schema.required.push(param.name)
    }
  }
  if (parameters_schema.required.length === 0) {
    delete parameters_schema.required
  }
  return parameters_schema
}

// 查找2XX的响应
export function extractFirst2xxJsonSchema(openapiResponses: any): any | null {
  try {
    const statusCodes = Object.keys(openapiResponses).filter(code => /^2\d\d$/.test(code))


    for (const status of statusCodes) {
      const response = openapiResponses[status]
      const content = response?.content
      const json = content?.["application/json"]
      if (json?.schema?.properties) {
        return json.schema
      }
    }
    // message.error("Unsupported response type")
    return null
  } catch (error) {
    return null
  }
}

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const addSchemaChild = (tree: SchemaNode, parentId: string) => {
  const walk = (n: SchemaNode): SchemaNode => {
    if (parentId === 'root') {
      return {
        ...n,
        children: [
          ...(n.children || []),
          {
            id: generateId(),
            name: '',
            editingName: true,
            type: 'string',
            required: false,
            in: 'body',
          },
        ],
      }
    }
    if (n.id === parentId) {
      if (n.type === 'object') {
        return {
          ...n,
          children: [
            ...(n.children || []),
            {
              id: generateId(),
              name: '',
              editingName: true,
              type: 'string',
              required: false,
              in: 'body',
            },
          ],
        }
      }
      if (n.type === 'array') {
        if (!n.item || n.item.type !== 'object') {
          return {
            ...n,
            item: {
              id: generateId(),
              name: 'item',
              editingName: true,
              type: 'object',
              required: false,
              in: 'body',
              children: [],
            },
          }
        } else {
          return {
            ...n,
            item: {
              ...n.item,
              children: [
                ...(n.item.children || []),
                {
                  id: generateId(),
                  name: '',
                  editingName: true,
                  type: 'string',
                  required: false,
                  in: 'body',
                },
              ],
            },
          }
        }
      }
    }
    if (n.children) return { ...n, children: n.children.map(walk) }
    if (n.item) return { ...n, item: walk(n.item) }
    return n
  }
  return walk(tree)
}
// tree转schema
export function treeNodeToSchema(node: SchemaNode): any {
  const s: any = { type: node.type }
  if (node.description) s.description = node.description
  if (node.default !== undefined) s.default = node.default
  if (node.type === 'object') {
    s.properties = {}
    const reqs: string[] = []
    node.children?.forEach(c => {
      s.properties[c.name] = treeNodeToSchema(c)
      if (c.required) reqs.push(c.name)
    })
    if (reqs.length) s.required = reqs
  }
  if (node.type === 'array' && node.item) {
    s.items = treeNodeToSchema(node.item)
  }
  return s
}
// 区分in body
export function categorizeNodes(nodes: any): { body?: any, data: any[] } {
  const result: { body?: any; data: any[] } = { data: [], body: [] }
  if (!nodes?.children) { return result }
  nodes?.children.forEach((node: SchemaNode) => {
    if (node.in === 'body') {
      result.body.push(node)
    } else {
      result.data.push({ ...node, schema: { type: node.type, default: node.default } })
    }
  })
  const body = treeNodeToSchema({ "id": "root", "name": "", "editingName": false, "type": "object", "required": false, "in": "body", "children": result.body })
  const data = result.data
  return { body, data };
}
// 将 JSON Schema 转成内部树节点
export function jsonSchemaToTreeNode(schema: any, name = '', inLocation = 'body'): SchemaNode {
  const node: SchemaNode = {
    id: generateId(),
    name,
    editingName: false,
    type: schema?.type,
    required: false,
    in: inLocation as any,
  }
  if (!schema) { return { ...node, children: [] } }
  if (schema.type === 'object') {
    node.children = []
    const props = schema.properties || {}
    for (const key of Object.keys(props)) {
      const childSchema = props[key]
      const childNode = jsonSchemaToTreeNode(childSchema, key, inLocation)
      childNode.required = Array.isArray(schema.required) && schema.required.includes(key)
      node.children.push(childNode)
    }
  }
  if (schema.type === 'array') {
    // 数组只映射 items
    if (schema.items) {
      node.item = jsonSchemaToTreeNode(schema.items, 'item', inLocation)
    }
  }
  // 如果有 default/description
  if (schema.default !== undefined) (node as any).default = schema.default
  if (schema.description) (node as any).description = schema.description
  if (schema.in) (node as any).in = schema.in
  return node
}

export function injectDefaults(schema: any, data: any): any {
  if (!schema) return schema
  if (schema.type === 'object' && schema.properties && typeof data === 'object' && data !== null) {
    const newProperties: any = {}
    for (const key in schema.properties) {
      const propSchema = schema.properties[key]
      const propValue = data?.[key]
      newProperties[key] = injectDefaults(propSchema, propValue)
    }
    return {
      ...schema,
      properties: newProperties
    }
  }
  if (schema.type === 'array' && Array.isArray(data)) {
    const itemsSchema = schema.items
    if (itemsSchema && typeof itemsSchema === 'object') {
      return {
        ...schema,
        default: data,
        items: itemsSchema
      }
    }
    return { ...schema, default: data }
  }
  return { ...schema, default: data }
}