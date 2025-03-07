import { create } from 'zustand';
import { fetchAdaptors, getCallgentTree } from '@/api/services/callgentService';
import { ModalNode, TreeActionState } from '#/store';
import { CallgentInfo, Realm } from '#/entity';
import { enhanceNode } from '@/utils/callgent-tree';

const initState = {
  callgentTree: [],
  realms: [],
  adaptors: [],
  modelTitle: "",
  action: null,
  currentNode: null,
  isModalOpen: false,
};

export const useTreeActionStore = create<TreeActionState>((set) => ({
  ...initState,
  actions: {
    setCallgentTree: (callgentTree: CallgentInfo[]) => set({ callgentTree }),
    setCallgentRealms: (realms: Realm[]) => set({ realms }),
    setCallgentAdaptor: (adaptors: any) => set({ adaptors }),
    openModal: (node: ModalNode) => set({ isModalOpen: true, currentNode: node }),
    closeModal: () => set({ isModalOpen: false, action: null, currentNode: null }),
  }
}));

// api
export const useFetchCallgentTree = () => {
  const { setCallgentTree, setCallgentRealms } = useTreeActions();
  const fetchCallgentServerList = async (id: string) => {
    try {
      const { data } = await getCallgentTree(id);
      const enhancedData = enhanceNode(data, 1);
      setCallgentTree([enhancedData]);
      setCallgentRealms(data?.realms || []);
      return data;
    } catch (err) {
      console.error(err);
    }
  };
  return fetchCallgentServerList;
};

// api
export const useFetchAdaptor = () => {
  const { setCallgentAdaptor } = useTreeActions();
  const fetchCallgentAdaptor = async () => {
    try {
      const { data } = await fetchAdaptors()
      setCallgentAdaptor(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  };
  return fetchCallgentAdaptor;
};

export const useTreeActions = () => useTreeActionStore((state) => state.actions);
export default useTreeActionStore;