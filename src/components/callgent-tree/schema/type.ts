/**
 * 此文件定义了树组件相关的数据结构和类型。
 */
export type NodeType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';

export interface TreeNodeData {
  id: number;
  _id: string; // Added
  name: string;
  type: NodeType;
  parentId?: number;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  enum?: (string | number)[];
  children?: TreeNodeData[];
  properties?: TreeNodeData[];
  items?: TreeNodeData;
  depth: number;
  in?: 'query' | 'header' | 'path' | 'cookie';
}

export interface TreeNodeProps {
  node: TreeNodeData;
  mode: 1 | 2 | 3;
  onSelect?: (node: TreeNodeData) => void;
  onUpdate?: (id: number, partial: Partial<TreeNodeData>) => void;
  onDelete?: (id: number) => void;
  onAdd?: (parentId: number) => void;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpand: (nodeId: number) => void;
  onEditNode?: (node: TreeNodeData) => void; // 新增编辑节点回调
  parentNodeType?: NodeType;
  treeType?: 'requestBody' | 'parameters' | 'responses';
  allNodes: TreeNodeData[];
}

export interface EditableTreeProps {
  data: TreeNodeData[];
  mode?: 1 | 2 | 3; // 1: 只读, 2: 可修改, 3: 只能设置默认值
  onSelect?: (node: TreeNodeData) => void;
  onChange?: (data: TreeNodeData[]) => void;
  onDelete?: (id: number) => void;
  onAdd?: (parentId: number, newNode: TreeNodeData) => void;
  className?: string;
  defaultExpandAll?: boolean;
  onEditNode?: (node: TreeNodeData) => void; // 新增编辑节点回调
  treeType?: 'requestBody' | 'parameters' | 'responses';
}

