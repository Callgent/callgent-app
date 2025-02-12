import callgentService from "@/api/services/callgentService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import type { CallgentInfo, PageInfo } from "#/entity";

// 定义新的 searchInfo 对象包含 query 和 adaptor
type CallgentStore = {
  callgentInfo: Partial<CallgentInfo>;
  callgentList: CallgentInfo[];
  pageInfo: PageInfo;
  searchInfo: { query: string; adaptor: string }; // 新增 searchInfo 对象
  actions: {
    setCallgentInfo: (callgentInfo: CallgentInfo) => void;
    clearCallgentInfo: () => void;
    setCallgentList: (callgentList: CallgentInfo[]) => void;
    setPageInfo: (pageInfo: PageInfo) => void;
    reset: () => void;
    setSearchInfo: (searchInfo: { query: string; adaptor: string }) => void;
  };
};

const useCallgentStore = create<CallgentStore>((set) => ({
  callgentInfo: {},
  callgentList: [],
  pageInfo: { page: 1, perPage: 2, total: 0 },
  searchInfo: { query: "", adaptor: "" }, // 默认值为空
  actions: {
    setCallgentInfo: (callgentInfo) => set({ callgentInfo }),
    clearCallgentInfo: () => set({ callgentInfo: {} }),
    setCallgentList: (callgentList) => set({ callgentList }),
    setPageInfo: (pageInfo) => set({ pageInfo }),
    reset: () => set({
      callgentInfo: {},
      callgentList: [],
      pageInfo: { page: 1, perPage: 2, total: 0 },
      searchInfo: { query: "", adaptor: "" },
    }),
    setSearchInfo: (searchInfo) => set({ searchInfo }),
  },
}));

export const useCallgentInfo = () => useCallgentStore((state) => state.callgentInfo);
export const useCallgentList = () => useCallgentStore((state) => state.callgentList);
export const usePageInfo = () => useCallgentStore((state) => state.pageInfo);
export const useSearchInfo = () => useCallgentStore((state) => state.searchInfo); // 获取 searchInfo
export const useCallgentActions = () => useCallgentStore((state) => state.actions);



/** Fetch Callgent list and store it in Zustand */
export const useFetchCallgentList = () => {
  const { query, adaptor } = useSearchInfo();
  const { setCallgentList, setPageInfo } = useCallgentActions();
  const callgentListMutation = useMutation({
    mutationFn: callgentService.getCallgents,
  });
  const fetchCallgentList = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await callgentListMutation.mutateAsync(searchTerm);
      setCallgentList(data);
      setPageInfo({ ...meta, query, adaptor, page: meta.currentPage });
    } catch (err) {
      toast.error(err.message, { position: "top-center" });
    }
  };
  return fetchCallgentList;
};

/** Fetch Callgent server list and store it in Zustand */
export const useFetchCallgentServerList = () => {
  const { setCallgentList, setPageInfo } = useCallgentActions();
  const { query, adaptor } = useSearchInfo();
  const callgentServerListMutation = useMutation({
    mutationFn: callgentService.getServer,
  });
  const fetchCallgentServerList = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await callgentServerListMutation.mutateAsync(searchTerm);
      setCallgentList(data);
      setPageInfo({ ...meta, query, adaptor });
    } catch (err) { }
  };
  return fetchCallgentServerList;
};

/** Create a new Callgent */
export const useCreateCallgent = () => {
  return useMutation({
    mutationFn: callgentService.postCallgent,
    onSuccess: () => {
      toast.success("Callgent created successfully!");
    },
  });
};

/** Update an existing Callgent */
export const useUpdateCallgent = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CallgentInfo }) => callgentService.putCallgent(id, data),
    onSuccess: () => {
      toast.success("Callgent updated successfully!");
    }
  });
};

/** Delete a Callgent */
export const useDeleteCallgent = () => {
  return useMutation({
    mutationFn: callgentService.deleteCallgent,
    onSuccess: () => {
      toast.success("Callgent deleted successfully!");
    },
  });
};

export default useCallgentStore;
