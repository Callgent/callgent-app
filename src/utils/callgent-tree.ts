import { Adaptor, CallgentInfo } from '#/entity';

export const enhanceNode = (node: CallgentInfo, level: number): CallgentInfo => {
  let enhancedNode = { ...node };
  if (level === 2) {
    enhancedNode = { ...enhancedNode, add: true };
  } else if (level === 3 && node?.type === "SERVER") {
    enhancedNode = { ...enhancedNode, edit: true, delete: true, import: true, lock: true };
  } else if (level === 3 || level === 1) {
    enhancedNode = { ...enhancedNode, edit: true, delete: true, lock: true };
  } else if (level === 4) {
    enhancedNode = { ...enhancedNode, lock: true };
  }
  if (node.children) {
    enhancedNode.children = node.children.map(child => enhanceNode(child, level + 1));
  }
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