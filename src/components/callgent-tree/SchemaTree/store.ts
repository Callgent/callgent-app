import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { flattenSchemaToMentions } from "./utils";

export const useSchemaTreeStore = create<any>()(
  persist(
    (set, get) => ({
      params: [],
      defResponses: [],
      parameters: [],
      requestBody: [],
      responses: [],
      inputOptions: [],
      isEdit: false,

      setIsEdit: (isEdit: boolean) => {
        set({ isEdit });
      },
      setParams: (params: any) => {
        set({ params: params });
      },
      setParameters: (parameters: any) => {
        set({ parameters });
      },
      setRequestBody: (requestBody: any) => {
        set({ requestBody });
      },
      setResponses: (responses: any) => {
        set({ responses: responses });
      },
      setDefResponses: (responses: any) => {
        set({ defResponses: responses });
      },
      // 表达式提示
      setInputOptions: (schema: any) => {
        set({ inputOptions: flattenSchemaToMentions(schema) });
      },
    }),
    {
      name: "schema-tree-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
