import { create } from "zustand";
import type { ChatBoxStore } from "@/types/store";

const initState = {
  chatBox: [],
};

const useChatBoxStore = create<ChatBoxStore>((set) => ({
  ...initState,
  actions: {
    addMessage: (newMessage: { role: string; message: string }) => {
      set((state) => ({
        chatBox: [...state.chatBox, newMessage],
      }));
    },
  }
}));

export default useChatBoxStore;