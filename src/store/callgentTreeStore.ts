import { create } from 'zustand';
import { useMutation } from '@tanstack/react-query';
import callgentService, { useFetchAdaptors } from '@/api/services/callgentService';
import { TreeActionState } from '#/store';
import { CallgentInfo } from '#/entity';
import { enhanceNode } from '@/utils/callgent-tree';

const initState = {
  callgentTree: [],
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
    setCallgentAdaptor: (adaptors: any) => set({ adaptors }),
    setAction: (action: 'add' | 'edit' | 'import' | 'lock' | null) => set({ action }),
    openModal: (node: {
      id: string;
      parentId?: string;
      type?: string;
      modelTitle?: string;
      data?: any;
    }) => set({ isModalOpen: true, currentNode: node }),
    closeModal: () => set({ isModalOpen: false, action: null, currentNode: null })
  },
}));

export const useCurrentNode = () => useTreeActionStore((state) => state.currentNode);
export const useAdaptors = () => useTreeActionStore((state) => state.adaptors);
export const useCallgentTree = () => useTreeActionStore((state) => state.callgentTree);

// api
export const useFetchCallgentTree = () => {
  const { setCallgentTree } = useTreeActions();
  const callgentServerListMutation = useMutation({
    mutationFn: callgentService.getCallgentTree,
  });
  const fetchCallgentServerList = async (id: string) => {
    try {
      const { data } = await callgentServerListMutation.mutateAsync(id);
      const enhancedData = enhanceNode(data, 1);
      setCallgentTree([enhancedData])
      setCallgentTree([enhancedData]);
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
  const callgentServerListMutation = useFetchAdaptors()
  const fetchCallgentAdaptor = async () => {
    try {
      const { data } = await callgentServerListMutation.mutateAsync();
      setCallgentAdaptor(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  };
  return fetchCallgentAdaptor;
};

export const useTreeActions = () => useTreeActionStore((state) => state.actions);
