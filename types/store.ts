import type { CallgentInfo, PageInfo } from "#/entity";

export interface CallgentStore {
  callgentInfo: Partial<CallgentInfo>;
  callgentList: CallgentInfo[];
  pageInfo: PageInfo;
  searchInfo: { query: string; adaptor: string };
  actions: {
    setCallgentInfo: (callgentInfo: CallgentInfo) => void;
    clearCallgentInfo: () => void;
    setCallgentList: (callgentList: CallgentInfo[]) => void;
    setPageInfo: (pageInfo: PageInfo) => void;
    reset: () => void;
    setSearchInfo: (searchInfo: { query: string; adaptor: string }) => void;
  };
};