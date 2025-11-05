import { EndpointState } from '#/store'
import { getEndpointApi, postEndpointsApi, putEndpointApi } from '@/api/services/callgentService';
import { convertOpenApiToTree, convertTreeToOpenApi, mergeParametersWithDefaults, mergeSchemasWithDefaults } from '@/components/callgent-tree/schema/utils';
import { jsonSchemaToTreeNode, extractFirst2xxJsonSchema, generateId, treeToSchema, extractAllDefaults, mergeSchemaWithFormData, transformArrayItems, flattenSchemaToMentions } from '@/components/callgent-tree/SchemaTree/utils';
import { unsavedGuard } from '@/router/utils';
import { convertToOpenAPI, restoreDataFromOpenApi } from '@/utils/callgent-tree';
import { message } from 'antd';
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware';

const initData = {
  status: null,
  editId: null,
  apiMapId: null,
  parameters: [],
  requestBody: [],
  responses: [],
  parameters2: [],
  requestBody2: [],
  responses2: [],
  formData: {},
  schemaData: {},
  isParameterOpen: false,
  isResponseOpen: false,
  isEndpointOpen: false,
  editIndex: -1,
  editType: '',
  information: {},
  activeKey: "1",
  paramsOptions: [],
  responsesOptions: [],
}

export const useEndpointStore = create<EndpointState>()(
  persist(
    (set, get) => ({
      ...initData,
      // 切换ep
      toggletheEP: async (id: string) => {
        const { data } = await getEndpointApi(id);
        const parameters = convertOpenApiToTree(data?.params?.parameters, 'parameters')
        const requestBody = convertOpenApiToTree(data?.params?.requestBody?.content["application/json"]?.schema, 'requestBody')
        const responsesSchema = extractFirst2xxJsonSchema(data?.responses)
        const responses = convertOpenApiToTree(responsesSchema, 'responses')
        set({
          status: 'define',
          editId: id,
          parameters,
          requestBody,
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
            statusCode: Object.keys(data?.metaExe?.apiMap?.responses || '')[0] || ''
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
        const { formData, information, editId, schemaData, parameters, requestBody, responses, parameters2, requestBody2 } = get();
        const data = convertToOpenAPI({
          path: information?.endpointName,
          operationId: information?.endpointName,
          endpointConfig: information.endpoint || {},
          whatFor: information?.whatFor,
          how2Ops: information?.how2Ops,
          params: {
            parameters: convertTreeToOpenApi(parameters, 'parameters'),
            requestBody: {
              content: {
                "application/json": {
                  schema: convertTreeToOpenApi(requestBody, 'requestBody'),
                }
              }
            }
          },
          responses: convertTreeToOpenApi(responses, 'responses'),
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
            parameters: convertTreeToOpenApi(parameters2, 'parameters'),
            requestBody: {
              content: {
                "application/json": {
                  schema: convertTreeToOpenApi(requestBody2, 'requestBody'),
                }
              }
            }
          },
          responses: {
            [information?.statusCode || '']: {
              content: {
                "application/json": {
                  schema: { ...apiMapData?.responses || {}, default: information?.responses_default }
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
          const queryParams = new URLSearchParams(location.search);
          const entryId = queryParams.get("entryId");
          await postEndpointsApi({ ...request, entryId })
        }
        unsavedGuard.setUnsavedChanges(false);
      },

      // 选择ep
      selectApi: async (id, entry, apiMap) => {
        const { formData, responses, information, setInformation } = get();
        const { data } = await getEndpointApi(id);
        let parameters2 = data?.params?.parameters
        let requestBody2 = data?.params?.requestBody?.content["application/json"]?.schema
        let responses2 = convertOpenApiToTree(extractFirst2xxJsonSchema(data?.responses), 'responses')
        let defaultValue = { response: '', response2: '' }
        if (apiMap) {
          const parameters2_default = apiMap?.params?.parameters
          const requestBody2_default = apiMap?.params?.requestBody?.content["application/json"]?.schema
          const responses_default = apiMap?.responses[information?.statusCode]?.content["application/json"]?.schema
          parameters2 = convertOpenApiToTree(mergeParametersWithDefaults(parameters2, parameters2_default), 'parameters')
          requestBody2 = convertOpenApiToTree(mergeSchemasWithDefaults(requestBody2, requestBody2_default), 'requestBody')
          responses2 = convertOpenApiToTree(mergeSchemasWithDefaults(responses, responses_default), 'responses')
          setInformation({ responses_default: responses_default?.default })
        }
        set({
          apiMapId: data.id,
          parameters2,
          requestBody2,
          responses2,
          formData: {
            ...formData,
            defaultValue,
            metaExe: {
              apiMap: { epId: data.id, epName: data.name, entry }
            }
          },
        })
      },
      // 表达式提示
      setParamsOptions: (schema: any) => {
        set({ paramsOptions: flattenSchemaToMentions(schema) });
      },
      setResponsesOptions: (schema: any) => {
        set({ responsesOptions: flattenSchemaToMentions(schema) });
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
      setRequestBody: (params) => set({ requestBody: params }),
      setResponses: (resps) => set({ responses: resps }),
      setParameters2: (params) => set({ parameters2: params }),
      setRequestBody2: (params) => set({ requestBody2: params }),
      setResponses2: (resps) => set({ responses2: resps }),
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
