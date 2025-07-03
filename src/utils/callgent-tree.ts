import { Adaptor, CallgentInfo } from '#/entity';

export const enhanceNode = (node: CallgentInfo, level: number): CallgentInfo => {
  let enhancedNode = { ...node };
  if (level === 2) {
    enhancedNode = { ...enhancedNode, parentType: node?.id, add: true };
  } else if (level === 3 && node?.type === "SERVER") {
    enhancedNode = { ...enhancedNode, parentType: node?.type, edit: true, delete: true, import: true, lock: true, virtualApi: true };
  } else if (level === 3) {
    enhancedNode = { ...enhancedNode, parentType: node?.type, edit: true, delete: true, lock: true, virtualApi: true };
  } else if (level === 1) {
    enhancedNode = { ...enhancedNode, parentType: node?.type, edit: true, delete: true, lock: true };
  } else if (level === 4) {
    enhancedNode = { ...enhancedNode, parentType: node?.type, lock: true, delete: true };
  }
  if (node.children) {
    enhancedNode.children = node.children.map(child => enhanceNode(child, level + 1));
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
  console.log(openApiSpec);

  return {
    operationId: operation?.operationId || method + path,
    path: path,
    method: method.toUpperCase(),
    whatFor: operation?.whatFor,
    description: operation?.description,
    params: {
      parameters: operation?.parameters || [],
      requestObject: operation?.requestBody || {}
    },
    responses: operation?.responses || {},
    rawJson: openApiSpec,
    how2exe: operation?.how2exe || null,
    how2Ops: operation?.how2Ops || null
  };
};