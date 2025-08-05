export interface TreeNodeData {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  in?: string;
  children?: TreeNodeData[];
  item?: TreeNodeData;
  editingName?: boolean;
  [key: string]: any;
}

export interface CommonProps {
  mode: 1 | 2 | 3;
  schemaType: "requestBody" | "parameters" | "responses";
}

export interface SchemaEditorProps extends CommonProps {
  schema: TreeNodeData[];
  submitSchema: (data: TreeNodeData[]) => void;
  setFormData: any;
}

export interface SchemaModalProps extends CommonProps {
  visible: boolean;
  initialValues: any;
  onCancel: () => void;
  onOk: (values: any) => void;
}

export interface SchemaNodeProps extends CommonProps {
  node: any;
  parentType?: string;
  depth: number;
  collapsed: boolean;
  toggleCollapse: (id: string) => void;
  openDetail: (id: string) => void;
  updateNode: (id: string, partial: Partial<any>) => void;
  addChild: (parentId: string) => void;
  deleteNode: (id: string) => void;
  setFormData: any;
}
