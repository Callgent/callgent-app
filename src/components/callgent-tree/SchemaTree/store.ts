import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { flattenSchemaToMentions } from "./utils";

export const useSchemaTreeStore = create<any>()(
  persist(
    (set) => ({
      params: [],
      defResponses: [],
      parameters: [],
      requestBody: [],
      responses: [],
      paramsOptions: [],
      responsesOptions: [],
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
      setParamsOptions: (schema: any) => {
        set({ paramsOptions: flattenSchemaToMentions(schema) });
      },
      setResponsesOptions: (schema: any) => {
        set({ responsesOptions: flattenSchemaToMentions(schema) });
      },
    }),
    {
      name: "schema-tree-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
