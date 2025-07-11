import { EndpointState } from '#/store'
import { getCallgentApi } from '@/api/services/callgentService';
import { extractFirst2xxJsonSchema, generateId, jsonSchemaToTreeNode } from '@/components/callgent-tree/endpoint/util';
import { create } from 'zustand'

const initData = {
  status: null,
  editId: null,
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
}

export const useEndpointStore = create<EndpointState>()(
  (set, get) => ({
    ...initData,
    // 切换ep
    toggletheEP: async (id: string) => {
      const { data } = await getCallgentApi(id);
      let parameters = data?.params?.parameters?.map((item: any) => ({ ...(item?.schema || {}), ...item, editingName: false, id: generateId() })) || []
      const requestBody = data?.params?.requestBody?.content["application/json"]?.schema
      const responsesSchema = extractFirst2xxJsonSchema(data?.responses)
      const responses = jsonSchemaToTreeNode(responsesSchema).children
      set({
        status: 'read_only',
        endpointName: data?.path || null,
        editId: id,
        parameters: requestBody ? [...parameters, ...(jsonSchemaToTreeNode(requestBody).children as [])] : parameters,
        whatFor: data?.whatFor || null,
        how2Ops: data?.how2Ops || null,
        responses,
        formData: {
          ...get().formData,
          parameters: parameters,
          requestBody: requestBody,
          responses: responses,
          endpoint: {
            method: data?.method || 'POST'
          }
        }
      })
    },
    setStatus: (type) => set({ status: type }),
    setEditId: (text) => set({ editId: text }),
    setEndpointName: (name) => set({ endpointName: name }),
    setWhatFor: (text) => set({ whatFor: text }),
    setHow2Ops: (text) => set({ how2Ops: text }),
    setParameters: (params) => set({ parameters: params }),
    setResponses: (resps) => set({ responses: resps }),
    setFormData: (data) => set({ formData: data }),
    setIsEndpointOpen: (open) => set({ isEndpointOpen: open }),
    clear: () => {
      set(initData)
    }
  })
)
