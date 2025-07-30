import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { flattenSchemaToMentions } from "./utils";
const initData = {
  parameters: [],
  requestBody: [],
  responses: [],
  paramsOptions: [],
  responsesOptions: [],
  isEdit: false,
  formData1: {},
  formData2: {},
  selectApi: {},
}

export const useSchemaTreeStore = create<any>()(
  persist(
    (set) => ({
      ...initData,
      setIsEdit: (isEdit: boolean) => {
        set({ isEdit });
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
      setFormData1: (formData1: any) => {
        set({ formData1 });
      },
      setFormData2: (formData2: any) => {
        set({ formData2 });
      },
      setSelectApi: (selectApi: any) => {
        set({ selectApi })
      },
      // 表达式提示
      setParamsOptions: (schema: any) => {
        set({ paramsOptions: flattenSchemaToMentions(schema) });
      },
      setResponsesOptions: (schema: any) => {
        set({ responsesOptions: flattenSchemaToMentions(schema) });
      },
      clearSchemaTreeStore: () => {
        set({ ...initData })
      },
    }),
    {
      name: "schema-tree-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
