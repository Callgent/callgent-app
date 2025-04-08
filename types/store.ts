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