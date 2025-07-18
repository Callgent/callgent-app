import { EndpointState } from '#/store'
import { getEndpointApi, postEndpointsApi, putEndpointApi } from '@/api/services/callgentService';
import { categorizeNodes, extractFirst2xxJsonSchema, generateId, injectDefaults, jsonSchemaToTreeNode } from '@/components/callgent-tree/endpoint/util';
import { convertToOpenAPI, restoreDataFromOpenApi } from '@/utils/callgent-tree';
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
      const { data } = await getEndpointApi(id);
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
    // 提交ep
    handleConfirm: async (currentNode) => {
      const { formData, endpointName, whatFor, how2Ops, editId } = get()
      console.log(formData?.metaExe?.apiMap?.api_data);
      const param = categorizeNodes({ children: formData.parameters })
      const data = convertToOpenAPI({
        path: endpointName,
        operationId: endpointName,
        endpointConfig: formData.endpoint || {},
        whatFor,
        params: {
          parameters: param.data || {},
          requestBody: formData.requestBody || {}
        },
        responses: formData.responses,
        how2Ops,
      })
      const api_data = formData?.metaExe?.apiMap?.api_data || {}
      const apiMap = (currentNode?.type === 'CLIENT' && formData?.metaExe?.apiMap?.epName) ? {
        epName: formData.metaExe?.apiMap?.epName,
        entry: formData.entry || formData?.metaExe?.apiMap?.entry,
        params: {
          parameters: formData.metaExe.parameters || {},
          requestBody: injectDefaults(api_data?.params?.requestBody?.content['application/json']?.schema, formData.metaExe.requestBody) || {}
        },
        responses: injectDefaults(extractFirst2xxJsonSchema(api_data?.responses), formData.metaExe.responses) || {}
      } : null
      const request = { ...restoreDataFromOpenApi(data), metaExe: { apiMap } }
      if (editId) {
        putEndpointApi(editId, request).then(() => {
          set({ editId: null })
        })
      } else {
        await postEndpointsApi(request)
      }
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
      set({ ...initData, status: 'define' })
    }
  })
)
