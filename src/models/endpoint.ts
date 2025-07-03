import { EndpointState } from '#/store'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useEndpointStore = create<EndpointState>()(
  persist(
    (set) => ({
      endpointName: '',
      whatFor: '',
      how2Ops: '',
      parameters: [],
      responses: [],
      formData: {},
      isParameterOpen: false,
      isResponseOpen: false,
      isEndpointOpen: false,
      editIndex: -1,
      editType: '',

      setEndpointName: (name) => set({ endpointName: name }),
      setWhatFor: (text) => set({ whatFor: text }),
      setHow2Ops: (text) => set({ how2Ops: text }),

      setParameters: (params) => set({ parameters: params }),
      addParameter: (param) =>
        set((state) => ({ parameters: [...state.parameters, param] })),
      updateParameter: (index, param) =>
        set((state) => {
          const newParams = [...state.parameters]
          newParams[index] = param
          return { parameters: newParams }
        }),
      removeParameter: (index) =>
        set((state) => {
          const newParams = [...state.parameters]
          newParams.splice(index, 1)
          return { parameters: newParams }
        }),

      setResponses: (resps) => set({ responses: resps }),
      addResponse: (resp) =>
        set((state) => ({ responses: [...state.responses, resp] })),
      removeResponse: (index) =>
        set((state) => {
          const newResponses = [...state.responses]
          newResponses.splice(index, 1)
          return { responses: newResponses }
        }),

      updateResponse: (index, resp) =>
        set((state) => {
          const newResponses = [...state.responses]
          newResponses[index] = resp
          return { responses: newResponses }
        }),

      setFormData: (data) => set({ formData: data }),

      setIsParameterOpen: (open) => set({ isParameterOpen: open }),
      setIsResponseOpen: (open) => set({ isResponseOpen: open }),
      setIsEndpointOpen: (open) => set({ isEndpointOpen: open }),

      setEditIndex: (i) => set({ editIndex: i }),
      setEditType: (t) => set({ editType: t }),
    }),
    {
      name: 'endpoint-form-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        endpointName: state.endpointName,
        whatFor: state.whatFor,
        how2Ops: state.how2Ops,
        parameters: state.parameters,
        responses: state.responses,
        formData: state.formData,
      }),
    }
  )
)
