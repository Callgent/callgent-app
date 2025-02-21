import type { CallgentInfo, PageInfo, TreeAction } from "#/entity";

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

export interface TreeActionState {
  callgentTree: CallgentInfo[];
  action: TreeAction | null;
  modelTitle: string;
  currentNode: {
    id: string;
    modelTitle?: string;
    parentId?: string;
    type?: string;
    data?: any;
  } | null;
  adaptors: any[],
  isModalOpen: boolean;
  actions: {
    setCallgentTree: (callgentTree: CallgentInfo[]) => void;
    setCallgentAdaptor: (adaptor: any) => void;
    openModal: (node: {
      id: string;
      parentId?: string;
      modelTitle?: string;
      type?: string;
      data?: any;
    }) => void;
    closeModal: () => void;
  }
}

export interface ModalNode {
  id: string;
  parentId?: string;
  type?: string;
  modelTitle?: string;
  data?: any;
}