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
  status: 'define' | 'implement' | 'read_only' | null
  editId: string | null
  endpointName: string
  whatFor: string
  how2Ops: string
  parameters: any[]
  responses: any[]
  formData: Record<string, any>
  isParameterOpen: boolean
  isResponseOpen: boolean
  isEndpointOpen: boolean
  editIndex: number
  editType: string

  toggletheEP: (id: string) => Promise<void>
  setStatus: (status: 'define' | 'implement' | null) => void
  setEditId: (name: string | null) => void
  setEndpointName: (name: string) => void
  setWhatFor: (text: string) => void
  setHow2Ops: (text: string) => void
  setParameters: (params: any[]) => void
  setResponses: (resps: any[]) => void
  setFormData: (data: Record<string, any>) => void
  setIsEndpointOpen: (open: boolean) => void
  clear: () => void
}

