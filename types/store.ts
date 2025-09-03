import type { CallgentInfo, PageInfo, Realm, TreeAction } from "#/entity";

export interface CallgentStore {
  callgentList: CallgentInfo[];
  pageInfo: PageInfo;
  searchInfo: { query: string; adaptor: string };
  actions: {
    clearCallgentInfo: () => void;
    setCallgentList: (callgentList: CallgentInfo[]) => void;
    setPageInfo: (pageInfo: PageInfo) => void;
    reset: () => void;
    setSearchInfo: (searchInfo: { query: string; adaptor: string }) => void;
  };
};

export interface ChatBoxStore {
  chatBox: { role: string; message: string }[];
  actions: {
    addMessage: (newMessage: { role: string; message: string }) => void;
  };
};

export interface TreeActionState {
  callgentTree: CallgentInfo[];
  realms: Realm[];
  realmKey: string;
  action: TreeAction | null;
  modelTitle: string;
  currentNode: CallgentInfo | null;
  adaptors: any[],
  isModalOpen: boolean;
  actions: {
    setCallgentTree: (callgentTree: CallgentInfo[]) => void;
    setCallgentRealms: (realms: Realm[]) => void;
    setCallgentAdaptor: (adaptor: any) => void;
    openModal: (node: ModalNode) => void;
    setCurrentNode: (node: CallgentInfo) => void;
    setRealmKey: (realmKey: string) => void;
    closeModal: () => void;
  }
}

export interface ModalNode {
  id: string;
  parentId?: string;
  type?: string;
  modelTitle?: string;
  data?: any;
  parentType?: string;
}

export interface EndpointState {
  status: 'define' | 'implement' | 'read_only' | 'edit' | null
  apiMapId: string | null
  editId: string | null
  parameters: any[]
  responses: any[]
  formData: Record<string, any>
  schemaData: Record<string, any>
  isParameterOpen: boolean
  isResponseOpen: boolean
  isEndpointOpen: boolean
  editIndex: number
  editType: string
  information: any
  activeKey: string
  paramsOptions: any[]
  responsesOptions: any[]
  setActiveKey: (key: any) => void
  setInformation: (information: any) => void
  toggletheEP: (id: string) => Promise<any>
  handleConfirm: (currentNode: any) => Promise<void>
  setStatus: (status: 'define' | 'implement' | 'edit' | null) => void
  setEditId: (name: string | null) => void
  setParameters: (params: any[]) => void
  setResponses: (resps: any[]) => void
  setFormData: (data: Record<string, any>) => void
  setSchemaData: (data: Record<string, any>) => void
  setIsEndpointOpen: (open: boolean) => void
  setParamsOptions: (data: any) => void
  setResponsesOptions: (data: any) => void
  selectApi: (id: string, entry: string[], apiMap: any) => Promise<void>
  clear: () => void
}

