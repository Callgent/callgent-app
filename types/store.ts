import type { CallgentInfo, PageInfo } from "#/entity";

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
  action: 'add' | 'edit' | 'import' | 'lock' | null;
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
    setAction: (action: 'add' | 'edit' | 'import' | 'lock' | null) => void;
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