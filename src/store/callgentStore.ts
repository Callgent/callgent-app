import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import callgentService from "@/api/services/callgentService";
import { toast } from "sonner";
import { StorageEnum } from "#/enum";
import type { CallgentInfo } from "#/entity";

// Define the state structure and actions for the store
type CallgentStore = {
  callgentInfo: Partial<CallgentInfo>;
  callgentList: CallgentInfo[]; // New state for storing the list
  actions: {
    setCallgentInfo: (callgentInfo: CallgentInfo) => void;
    clearCallgentInfo: () => void;
    setCallgentList: (callgentList: CallgentInfo[]) => void; // New action to set the list
  };
};

// Define the Zustand store with persistence
const useCallgentStore = create<CallgentStore>()(
  persist(
    (set) => ({
      callgentInfo: {},
      callgentList: [], // Initialize the list as an empty array
      actions: {
        setCallgentInfo: (callgentInfo) => {
          set({ callgentInfo });
        },
        clearCallgentInfo() {
          set({ callgentInfo: {} });
        },
        setCallgentList: (callgentList) => { // Define the setCallgentList action
          set({ callgentList });
        },
      },
    }),
    {
      name: "callgentStore",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        [StorageEnum.CallgentList]: state.callgentList,
      }),
    },
  ),
);

export const useCallgentInfo = () => useCallgentStore((state) => state.callgentInfo);
export const useCallgentList = () => useCallgentStore((state) => state.callgentList); // Selector for the list
export const useCallgentActions = () => useCallgentStore((state) => state.actions);

/** Fetch Callgent list and store it in Zustand */
export const useFetchCallgentList = () => {
  const { setCallgentList } = useCallgentActions(); // Get the action to set the list

  const callgentListMutation = useMutation({
    mutationFn: callgentService.getCallgents, // API function to fetch the list
  });

  const fetchCallgentList = async (searchTerm = '') => {
    try {
      const { data } = await callgentListMutation.mutateAsync({ query: searchTerm }); // Fetch the data
      setCallgentList(data);
    } catch (err) {
      toast.error(err.message, { position: "top-center" }); // Handle error and show toast
    }
  };

  return fetchCallgentList;
};

/** Create a new Callgent */
export const useCreateCallgent = () => {
  return useMutation({
    mutationFn: callgentService.postCallgent,
    onSuccess: () => {
      toast.success("Callgent created successfully!");
    },
    onError: (err) => {
      toast.error(err.message, { position: "top-center" });
    },
  });
};

/** Update an existing Callgent */
export const useUpdateCallgent = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CallgentInfo }) => callgentService.putCallgent(id, data),
    onSuccess: () => {
      toast.success("Callgent updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message, { position: "top-center" });
    },
  });
};

/** Delete a Callgent */
export const useDeleteCallgent = () => {
  return useMutation({
    mutationFn: callgentService.deleteCallgent,
    onSuccess: () => {
      toast.success("Callgent deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.message, { position: "top-center" });
    },
  });
};

export default useCallgentStore;
