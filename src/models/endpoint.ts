import { EndpointState } from '#/store'
import { getEndpointApi, postEndpointsApi, putEndpointApi } from '@/api/services/callgentService';
import { jsonSchemaToTreeNode, extractFirst2xxJsonSchema, generateId, treeToSchema, extractAllDefaults, mergeSchemaWithFormData, transformArrayItems } from '@/components/callgent-tree/SchemaTree/utils';
import { unsavedGuard } from '@/router/utils';
import { convertToOpenAPI, restoreDataFromOpenApi } from '@/utils/callgent-tree';
import { message } from 'antd';
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware';

const initData = {
  status: null,
  editId: null,
  parameters: [],
  responses: [],
  formData: {},
  schemaData: {},
  isParameterOpen: false,
  isResponseOpen: false,
  isEndpointOpen: false,
  editIndex: -1,
  editType: '',
  information: {},
  activeKey: "1"
}

export const useEndpointStore = create<EndpointState>()(
  persist(
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
          schemaData: {
            parameters,
            requestBody,
            responses
          },
          formData: {
            ...get().formData,
            metaExe: data?.metaExe
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
        // 填充apiMap
        const { selectApi } = get()
        const apiMap = data?.metaExe?.apiMap
        if (apiMap?.epId) {
          await selectApi(apiMap.epId, apiMap?.entry, apiMap)
        }
        unsavedGuard.setUnsavedChanges(false);
        return { data, formData: { parameters, requestBody, responses } }
      },

      // 提交ep
      handleConfirm: async (currentNode) => {
        const { formData, information, editId, schemaData } = get();
        const data = convertToOpenAPI({
          path: information?.endpointName,
          operationId: information?.endpointName,
          endpointConfig: information.endpoint || {},
          whatFor: information?.whatFor,
          how2Ops: information?.how2Ops,
          responses: treeToSchema(schemaData.responses),
          params: {
            parameters: transformArrayItems(schemaData?.parameters) || [],
            requestBody: {
              content: {
                "application/json": {
                  schema: treeToSchema(schemaData.requestBody) || {},
                }
              }
            }
          }
        })
        const metaExe = formData?.metaExe;
        let apiMapData = mergeSchemaWithFormData(
          {
            parameters2: schemaData?.parameters2,
            requestBody2: schemaData?.requestBody2,
            responses: schemaData?.responses
          },
          {
            parameters2: formData?.parameters2,
            requestBody2: formData?.requestBody2,
            responses: formData?.responses,
          }
        )
        const apiMap = (currentNode?.type === 'CLIENT' && metaExe?.apiMap?.epId) ? {
          epId: metaExe?.apiMap?.epId,
          epName: metaExe?.apiMap?.epName,
          entry: metaExe?.apiMap?.entry,
          params: {
            parameters: transformArrayItems(jsonSchemaToTreeNode(apiMapData?.parameters2)?.children) || [],
            requestBody: {
              content: {
                "application/json": {
                  schema: apiMapData?.requestBody2 || {},
                }
              }
            }
          },
          responses: {
            statusCode: metaExe?.statusCode || '',
            "200": {
              content: {
                "application/json": {
                  schema: apiMapData?.responses || {}
                }
              }
            }
          }
        } : null
        const request = { ...restoreDataFromOpenApi(data), metaExe: { apiMap } }
        if (editId) {
          putEndpointApi(editId, request).then(() => {
            message.success('success')
          })
        } else {
          await postEndpointsApi(request)
        }
        unsavedGuard.setUnsavedChanges(false);
      },

      // 选择ep
      selectApi: async (id, entry, apiMap) => {
        const { formData, schemaData } = get();
        const { data } = await getEndpointApi(id);
        let parameters2 = jsonSchemaToTreeNode(treeToSchema(data?.params?.parameters))?.children || []
        let requestBody2 = jsonSchemaToTreeNode(data?.params?.requestBody?.content["application/json"]?.schema)?.children || []
        let responses2 = jsonSchemaToTreeNode(extractFirst2xxJsonSchema(data?.responses))?.children || []
        let responses = schemaData?.responses
        let defaultValue = { response: '', response2: '' }
        if (apiMap) {
          const parameters2_default = extractAllDefaults(apiMap?.params?.parameters.map((item: any) => ({ ...item, id: item?._id })) || [])
          const requestBody2_default = extractAllDefaults(jsonSchemaToTreeNode(apiMap?.params?.requestBody?.content["application/json"]?.schema)?.children || [])
          const responsesDefault = extractFirst2xxJsonSchema(apiMap?.responses)
          const responses_default = extractAllDefaults(jsonSchemaToTreeNode(responsesDefault)?.children || [])
          const data = mergeSchemaWithFormData({ parameters2, requestBody2, responses }, {
            parameters2: parameters2_default,
            requestBody2: requestBody2_default,
            responses: { ...responses_default, root_response: responsesDefault?.default },
          })
          defaultValue.response = responsesDefault?.default || ""
          parameters2 = jsonSchemaToTreeNode(data?.parameters2).children || []
          requestBody2 = jsonSchemaToTreeNode(data?.requestBody2).children || []
          responses = jsonSchemaToTreeNode(data?.responses).children || []
        }
        set({
          formData: {
            ...formData,
            defaultValue,
            metaExe: {
              apiMap: { epId: data.id, epName: data.name, entry }
            }
          },
          schemaData: {
            ...schemaData,
            parameters2,
            requestBody2,
            responses2,
            responses
          }
        })
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
      setIsEndpointOpen: (open) => set({ isEndpointOpen: open }),
      clear: () => {
        set({ ...initData, status: 'define' })
      }
    }),
    {
      name: "schema-endpoint-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
