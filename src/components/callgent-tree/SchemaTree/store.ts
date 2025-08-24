import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { flattenSchemaToMentions } from "./utils";
const initData = {
  schemaData: {},
  paramsOptions: [],
  responsesOptions: [],
  formData: {},
};

export const useSchemaTreeStore = create<any>()(
  persist(
    (set) => ({
      ...initData,
      setSchemaData: (schemaData: any) => {
        set((state: any) => ({
          schemaData:
            typeof schemaData === "function"
              ? schemaData(state.schemaData)
              : { ...state.schemaData, ...schemaData },
        }));
      },
      setFormData: (formData: any) => {
        set((state: any) => ({
          formData:
            typeof formData === "function"
              ? formData(state.formData)
              : { ...state.formData, ...formData },
        }));
      },
      // 表达式提示
      setParamsOptions: (schema: any) => {
        set({ paramsOptions: flattenSchemaToMentions(schema) });
      },
      setResponsesOptions: (schema: any) => {
        set({ responsesOptions: flattenSchemaToMentions(schema) });
      },
      clearSchema: () => {
        set({ ...initData });
      },
    }),
    {
      name: "schema-tree-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
