import { toast } from "sonner";
import { create } from "zustand";
import type { CallgentInfo, PageInfo } from "@/types/entity";
import type { CallgentStore } from "@/types/store";
import { getCallgents, getServer, getTasks, postCallgent, putCallgent, deleteCallgent } from "@/api/callgentService";

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

/** Fetch Callgent list and store it in Zustand */
export const useFetchCallgentList = () => {
  const { setCallgentList, setPageInfo } = useCallgentActions();
  const fetchCallgentList = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await getCallgents(searchTerm);
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
  const { searchInfo } = useCallgentStore()
  const { query, adaptor } = searchInfo;
  const fetchCallgentServerList = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await getServer(searchTerm);
      setCallgentList(data);
      setPageInfo({ ...meta, query, adaptor });
    } catch (err) { }
  };
  return fetchCallgentServerList;
};

/** Fetch Callgent server list and store it in Zustand */
export const useFetchCallgentTasks = () => {
  const { setCallgentList, setPageInfo } = useCallgentActions();
  const { searchInfo } = useCallgentStore()
  const { query, adaptor } = searchInfo;
  const fetchCallgentTasks = async (searchTerm: PageInfo) => {
    try {
      const { data, meta } = await getTasks(searchTerm);
      setCallgentList(data);
      setPageInfo({ ...meta, query, adaptor });
    } catch (err) { }
  };
  return fetchCallgentTasks;
};

/** Create a new Callgent */
export const useCreateCallgent = () => {
  const fetchCallgentList = useFetchCallgentList();
  const createCallgent = async (values: CallgentInfo) => {
    await postCallgent(values).then(() => {
      toast.success("Callgent created successfully!")
    }).catch(() => { });
    await fetchCallgentList({ page: 1 })
  }
  return createCallgent;
};

/** Update an existing Callgent */
export const useUpdateCallgent = () => {
  const { setCallgentList } = useCallgentActions();
  const { callgentList } = useCallgentStore();
  const updateCallgent = async (id: string, values: CallgentInfo) => {
    // Perform the mutation to update the callgent
    const { data } = await putCallgent(id, values);
    if (data) {
      toast.success("Callgent updated successfully!");
    }
    const updatedList = callgentList.map(item =>
      item.id === id ? { ...item, ...data } : item
    );
    setCallgentList(updatedList);
  };

  return updateCallgent;
};


/** Delete a Callgent */
export const useDeleteCallgent = () => {
  const { actions, callgentList } = useCallgentStore();
  const deleteCallgent_ = async (id: string) => {
    await deleteCallgent(id).then(() => {
      toast.success("Callgent deleted successfully!");
      const updatedList = callgentList.filter(item => item.id !== id);
      actions.setCallgentList(updatedList);
    }).catch(() => { });
  };
  return deleteCallgent_;
};


export default useCallgentStore;
export const useCallgentActions = () => useCallgentStore((state) => state.actions);