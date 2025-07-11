import { Adaptor, CallgentInfo } from '#/entity';

// 控制节点状态
export const enhanceNode = (node: CallgentInfo, level: number, parentType: string | undefined): CallgentInfo => {
  let enhancedNode = { ...node };
  if (level === 1) {
    enhancedNode = { ...enhancedNode, parentType: parentType, edit: true, delete: true, lock: true };
  } else if (level === 2) {
    enhancedNode = { ...enhancedNode, parentType: parentType, add: true };
  } else if (level === 3) {
    enhancedNode = { ...enhancedNode, parentType: parentType, edit: true, delete: true, lock: true, virtualApi: true, import: true, };
  } else if (level === 4) {
    enhancedNode = { ...enhancedNode, parentType: parentType, delete: true, lock: true };
  }
  if (node.children) {
    if (level === 2) { node.type = node.id }
    enhancedNode.children = node.children.map(child => enhanceNode(child, level + 1, node.type));
  }
  enhancedNode.selectedOptions = node?.securities?.map((obj: string) => Object.keys(obj)[0]) || [];
  return enhancedNode;
};

export const setAdaptor = (adaptor: Adaptor) => {
  if (!adaptor) { return [] }
  return Object.entries(adaptor).map(([key, value]) => ({
    name: key,
    path: value
  }));
}

export const deleteNode = (nodes: CallgentInfo[], id: string): CallgentInfo[] => {
  return nodes.reduce((acc: CallgentInfo[], node) => {
    if (node.id === id) {
      return acc;
    }
    if (node.children) {
      node.children = deleteNode(node.children, id);
    }
    acc.push(node);
    return acc;
  }, []);
};

export const callgentApi = (data: any) => {
  return {
    openapi: data.openapi || "3.0.0",
    paths: {
      [data.path]: {
        [data.method.toLowerCase()]: {
          operationId: data?.operationId,
          whatFor: data?.whatFor,
          description: data?.description,
          parameters: data?.params?.parameters || [],
          requestBody: data?.params?.requestObject || data?.params?.requestBody || {},
          responses: data?.responses,
        },
      },
    },
  };
}

export const restoreDataFromOpenApi = (openApiSpec: any) => {
  const path = Object.keys(openApiSpec.paths)[0];
  const method = Object.keys(openApiSpec.paths[path])[0];
  const operation = openApiSpec.paths[path][method];
  return {
    operationId: operation?.operationId || method + path,
    path: path,
    method: method.toUpperCase(),
    whatFor: operation?.whatFor,
    description: operation?.description,
    params: {
      parameters: operation?.parameters || [],
      requestBody: operation?.requestBody || {}
    },
    responses: operation?.responses || {},
    rawJson: openApiSpec,
    how2exe: operation?.how2exe || null,
    how2Ops: operation?.how2Ops || null
  };
};

// Convert config object to OpenAPI 3.0 specification format
export function convertToOpenAPI(config: any) {
  const { path, operationId, whatFor, how2Ops } = config;
  const method = config.endpointConfig?.method?.toLowerCase() || 'get';
  const { parameters, requestBody } = config.params
  const responseSchema = config.responses
  // Construct standard 200 response schema
  const responses = {
    '200': {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
    }
  };
  // Return OpenAPI 3.0 specification object
  return {
    openapi: "3.0.0",
    paths: {
      [path]: {
        [method]: {
          operationId,
          how2exe: config?.endpointConfig?.how2exe || null,
          whatFor,
          parameters,
          requestBody,
          responses,
          how2Ops,
        },
      },
    },
  };
}

type ParamItem = {
  name: string
  type: string
  method: string
  children?: ParamItem[]
}
export function insertParamItem(
  list: ParamItem[],
  obj: ParamItem,
  parentName?: string
): ParamItem[] {
  if (!parentName) {
    const exists = list.some(item => item.name === obj.name)
    return exists ? list : [...list, obj]
  }

  const dfs = (items: ParamItem[]): ParamItem[] => {
    return items.map(item => {
      if (item.name === parentName) {
        const children = item.children || []
        const exists = children.some(child => child.name === obj.name)
        return exists
          ? item
          : {
            ...item,
            children: [...children, obj]
          }
      }
      if (item.children) {
        return {
          ...item,
          children: dfs(item.children)
        }
      }
      return item
    })
  }

  return dfs(list)
}

export const findParent = (nodes: any, key: string, parent: any = null): any => {
  for (const node of nodes) {
    if (node.key === key) return parent
    if (node.children) {
      const found = findParent(node.children, key, node)
      if (found) return found
    }
  }
  return null
}

export const updateNode = (nodes: any, key: string, updates: any): any[] => {
  return nodes.map((node: any) => {
    if (node.key === key) {
      return { ...node, ...updates }
    }
    if (node.children) {
      return { ...node, children: updateNode(node.children, key, updates) }
    }
    return node
  })
}

export const deleteNodes = (nodes: any, key: string): any[] => {
  return nodes
    .map((node: any) => {
      if (node.key === key) return null
      if (node.children) {
        node.children = deleteNodes(node.children, key).filter(Boolean)
      }
      return node
    })
    .filter(Boolean)
}
export const recursiveAdd = (nodes: any[], parentKey: string, newNode: any): any[] => {
  return nodes.map(node => {
    if (node.key === parentKey) {
      return {
        ...node,
        children: [...(node.children || []), newNode]
      }
    } else if (node.children) {
      return {
        ...node,
        children: recursiveAdd(node.children, parentKey, newNode)
      }
    }
    return node
  })
}
import { message } from "antd"
export const commitEdit = (treeData: any, key: string, value: string) => {
  if (!value.trim()) { return deleteNodes(treeData, key) }
  const parent = findParent(treeData, key)
  const siblings = parent ? parent.children : treeData
  const exists = siblings?.some((node: any) => node.key !== key && node.name === value)
  if (exists) {
    message.error('A field with the same name already exists at the same level')
    return deleteNodes(treeData, key)
  } else {
    return updateNode(treeData, key, { name: value })
  }
}


export function nodeToSchema(node: any): any {
  if (node.type === 'object') {
    const props: Record<string, any> = {}
    if (node.children) {
      node.children.forEach((child: any) => {
        props[child.name] = nodeToSchema(child)
      })
    }
    return {
      type: 'object',
      description: node.description || undefined,
      properties: props,
      required: node.children
        ? node.children.filter((c: any) => c.required).map((c: any) => c.name)
        : []
    }
  } else {
    const schema: any = {
      type: node.type
    }
    if (node.default) schema.default = node.default
    if (node.description) schema.description = node.description
    return schema
  }
}


export function treeToOpenAPI(tree: any[]) {
  const parameters: any[] = []
  const bodyProperties: Record<string, any> = {}
  const bodyRequired: string[] = []

  tree.forEach(node => {
    if (node.in === 'body') {
      bodyProperties[node.name] = {
        ...nodeToSchema(node),
        ...(node.prompt ? { mapping: node.prompt } : {})
      }
      if (node.required) bodyRequired.push(node.name)
    } else {
      parameters.push({
        name: node.name,
        in: node.in,
        required: node.required || false,
        description: node.description || undefined,
        schema: nodeToSchema(node),
        ...(node?.prompt ? { mapping: node.prompt } : {})
      })
    }
  })

  const requestBody = Object.keys(bodyProperties).length
    ? {
      required: bodyRequired.length > 0,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: bodyProperties,
            required: bodyRequired.length > 0 ? bodyRequired : undefined,

          }
        }
      }
    }
    : undefined

  return { parameters, requestBody }
}

// Response node to schema
export function treeToResponseSchema(tree: any[]) {
  const props: Record<string, any> = {}
  const required: string[] = []

  tree.forEach(node => {
    props[node.name] = nodeToSchema(node)
    if (node.required) required.push(node.name)
  })

  return {
    type: 'object',
    properties: props,
    required: required.length > 0 ? required : undefined
  }
}

export function convertEndpointsToTreeNodes(endpoints: any[]) {
  return endpoints.map(ep => ({
    title: ep.name,
    value: ep.id,
    key: ep.id,
    isLeaf: true,
    fullData: ep,
    host: ep.host,
  }))
}

export function convertSentriesToTreeNodes(sentries: any[]) {
  return sentries.map(sentry => ({
    title: `${sentry.host} / ${sentry.adaptor}`,
    value: `sentry-${sentry.id}`,
    key: `sentry-${sentry.id}`,
    isLeaf: false,
    callgentIds: sentry.callgentIds,
    children: [],
    host: sentry.host,
  }))
}

export function updateTreeNode(list: any[], key: string, children: any[]): any[] {
  return list.map(node => {
    if (node.key === key) {
      return { ...node, children }
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateTreeNode(node.children, key, children) }
    }
    return node
  })
}

export const findNode = (tree: any[], key: string): any => {
  for (const node of tree) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}
