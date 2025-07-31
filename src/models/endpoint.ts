import { EndpointState } from '#/store'
import { getEndpointApi, postEndpointsApi, putEndpointApi } from '@/api/services/callgentService';
import { jsonSchemaToTreeNode, extractFirst2xxJsonSchema, generateId, treeToSchema } from '@/components/callgent-tree/SchemaTree/utils';
import { unsavedGuard } from '@/router/utils';
import { convertToOpenAPI, restoreDataFromOpenApi } from '@/utils/callgent-tree';
import { create } from 'zustand'

const initData = {
  status: null,
  editId: null,
  parameters: [],
  responses: [],
  formData: {},
  isParameterOpen: false,
  isResponseOpen: false,
  isEndpointOpen: false,
  editIndex: -1,
  editType: '',
  information: {},
  activeKey: "1"
}

export const useEndpointStore = create<EndpointState>()(
  (set, get) => ({
    ...initData,
    // 切换ep
    toggletheEP: async (id: string) => {
      const { data } = await getEndpointApi(id);
      const parameters = data?.params?.parameters?.map((item: any) => ({ ...(item?.schema || {}), ...item, editingName: false, id: generateId() })) || []
      const requestBody = jsonSchemaToTreeNode(data?.params?.requestBody?.content["application/json"]?.schema)?.children || []
      const responsesSchema = extractFirst2xxJsonSchema(data?.responses)
      const responses = jsonSchemaToTreeNode(responsesSchema)?.children || []
      set({
        status: 'define',
        editId: id,
        parameters: requestBody ? [...parameters, ...requestBody] : parameters,
        responses,
        formData: {
          ...get().formData,
          parameters: parameters,
          requestBody: requestBody,
          responses: responses,
        },
        information: {
          endpointName: data?.path || null,
          whatFor: data?.whatFor || null,
          how2Ops: data?.how2Ops || null,
          endpoint: {
            method: data?.method || 'POST'
          },
        },
        activeKey: "1"
      })
      unsavedGuard.setUnsavedChanges(false);
      return { data, formData: { parameters, requestBody, responses } }
    },
    // 提交ep
    handleConfirm: async (currentNode) => {
      const { formData, information, editId } = get()
      const data = convertToOpenAPI({
        path: information?.endpointName,
        operationId: information?.endpointName,
        endpointConfig: information.endpoint || {},
        whatFor: information?.whatFor,
        how2Ops: information?.how2Ops,
        responses: treeToSchema(formData.responses),
        params: {
          parameters: formData?.parameters || [],
          requestBody: {
            content: {
              "application/json": {
                schema: treeToSchema(formData.requestBody) || {},
              }
            }
          }
        }
      })
      const apiMap = (currentNode?.type === 'CLIENT' && formData?.metaExe?.apiMap?.epName) ? {
        epName: formData.metaExe?.apiMap?.epName,
        entry: formData.entry || formData?.metaExe?.apiMap?.entry,
        params: {
          parameters: formData.metaExe.parameters || [],
          requestBody: {
            content: {
              "application/json": {
                schema: treeToSchema(formData.metaExe.requestBody) || {},
              }
            }
          }
        },
        responses: {
          statusCode: formData.metaExe?.statusCode || '',
          "200": {
            content: {
              "application/json": {
                schema: treeToSchema(formData.metaExe.responses) || {}
              }
            }
          }
        }
      } : null
      const request = { ...restoreDataFromOpenApi(data), metaExe: { apiMap } }
      if (editId) {
        putEndpointApi(editId, request).then(() => {
          set({ editId: null })
        })
      } else {
        await postEndpointsApi(request)
      }
      unsavedGuard.setUnsavedChanges(false);
    },
    setInformation: (information: any) => {
      unsavedGuard.setUnsavedChanges(true);
      set({ information: { ...get().information, ...information } })
    },
    setActiveKey: (activeKey) => {
      set({ activeKey })
    },
    setStatus: (type) => set({ status: type }),
    setEditId: (text) => set({ editId: text }),
    setParameters: (params) => set({ parameters: params }),
    setResponses: (resps) => set({ responses: resps }),
    setFormData: (data) => set({ formData: data }),
    setIsEndpointOpen: (open) => set({ isEndpointOpen: open }),
    clear: () => {
      set({ ...initData, status: 'define' })
    }
  })
)
