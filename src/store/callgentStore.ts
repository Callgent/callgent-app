import callgentService from "@/api/services/callgentService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import type { CallgentInfo, PageInfo } from "#/entity";
import type { CallgentStore } from "#/store";

const initState = {
  callgentInfo: {},
  callgentList: [],
  pageInfo: { page: 1, perPage: 10, total: 0 },
  searchInfo: { query: "", adaptor: "" },
}

const useCallgentStore = create<CallgentStore>((set) => ({
  ...initState,
  actions: {
    clearCallgentInfo: () => set({}),
    setCallgentList: (callgentList) => set({ callgentList }),
    setPageInfo: (pageInfo) => set({ pageInfo }),
    reset: () => set(initState),
    setSearchInfo: (searchInfo) => set({ searchInfo }),
  },
}));

export const useCallgentList = () => useCallgentStore((state) => state.callgentList);
export const usePageInfo = () => useCallgentStore((state) => state.pageInfo);
export const useSearchInfo = () => useCallgentStore((state) => state.searchInfo);
export const useCallgentActions = () => useCallgentStore((state) => state.actions);

/** Fetch Callgent list and store it in Zustand */
export const useFetchCallgentList = () => {
  const { setCallgentList, setPageInfo } = useCallgentActions();
  const callgentListMutation = useMutation({
    mutationFn: callgentService.getCallgents,
  });
  const fetchCallgentList = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await callgentListMutation.mutateAsync(searchTerm);
      setCallgentList(data);
      setPageInfo({ page: meta.currentPage, perPage: meta.perPage, total: meta.total });
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

/** Fetch Callgent server list and store it in Zustand */
export const useFetchCallgentTasks = () => {
  const { setCallgentList, setPageInfo } = useCallgentActions();
  const { query, adaptor } = useSearchInfo();
  const callgentServerListMutation = useMutation({
    mutationFn: callgentService.getTasks,
  });
  const fetchCallgentTasks = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await callgentServerListMutation.mutateAsync(searchTerm);
      setCallgentList(data);
      setPageInfo({ ...meta, query, adaptor });
    } catch (err) { }
  };
  return fetchCallgentTasks;
};

/** Create a new Callgent */
export const useCreateCallgent = () => {
  const createCallgentMutation = useMutation({
    mutationFn: callgentService.postCallgent,
    onSuccess: () => {
      toast.success("Callgent created successfully!");
    },
  });
  const fetchCallgentList = useFetchCallgentList();
  const createCallgent = async (values: CallgentInfo) => {
    await createCallgentMutation.mutateAsync(values);
    await fetchCallgentList({ page: 1 })
  }
  return createCallgent;
};

/** Update an existing Callgent */
export const useUpdateCallgent = () => {
  const updateCallgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CallgentInfo }) => callgentService.putCallgent(id, data),
    onSuccess: () => {
      toast.success("Callgent updated successfully!");
    },
  });

  const { setCallgentList } = useCallgentActions();
  const callgentList = useCallgentList();
  const updateCallgent = async (id: string, values: CallgentInfo) => {
    // Perform the mutation to update the callgent
    const { data } = await updateCallgentMutation.mutateAsync({ id, data: values });
    const updatedList = callgentList.map(item =>
      item.id === id ? { ...item, ...data } : item
    );
    setCallgentList(updatedList);
  };

  return updateCallgent;
};


/** Delete a Callgent */
export const useDeleteCallgent = () => {
  const fetchCallgentList = useFetchCallgentList();
  const deleteCallgentMutation = useMutation({
    mutationFn: callgentService.deleteCallgent,
    onSuccess: () => {
      toast.success("Callgent deleted successfully!");
      fetchCallgentList({ page: 1 });
    },
  });
  const deleteCallgent = async (id: string) => {
    await deleteCallgentMutation.mutateAsync(id);
  };
  return deleteCallgent;
};


export default useCallgentStore;
