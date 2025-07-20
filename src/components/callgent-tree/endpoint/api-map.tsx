import { getSchema, injectDefaults, jsonSchemaToTreeNode } from './util'
import { useEndpointStore } from '@/models/endpoint'
import { useEffect, useState } from 'react'
import { Select } from 'antd'
import SchemaEditor from '../SchemaTree/SchemaEditor'
import RjsfAntd from '../SchemaTree/rjsf-antd'
import { flattenSchemaToMentions } from '@/utils/callgent-tree'

export default function ApiMap({ data, apiResponses, refs }: { data: any, apiResponses: any, refs: { parametersRef: any, requestBodyRef: any, responsesRef: any } }) {
  const { setFormData, formData } = useEndpointStore()
  const [mediaTypeOptions, setMediaTypeOptions] = useState<string[]>([])
  const [selectedMediaType, setSelectedMediaType] = useState<string | undefined>()

  useEffect(() => {
    const content = data?.requestBody?.content
    if (content && typeof content === 'object') {
      const types = Object.keys(content)
      setMediaTypeOptions(types)
      setSelectedMediaType(types[0])
    }
  }, [data])

  const handleSubmit = (form: any, type: string) => {
    setFormData({
      ...formData,
      metaExe: {
        ...formData?.metaExe,
        [type]: form.formData
      }
    })
  }
  const schema = selectedMediaType && data?.requestBody?.content?.[selectedMediaType]?.schema
  return (
    <div className="space-y-4 mt-2 max-h-[500px] overflow-x-hidden border p-2 rounded">
      {mediaTypeOptions.length > 1 && (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Select Media Type</label>
          <Select
            className="w-full"
            options={mediaTypeOptions.map(type => ({ label: type, value: type }))}
            value={selectedMediaType}
            onChange={setSelectedMediaType}
          />
        </div>
      )}
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api1
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor
            mode={1}
            schemaType="params"
            schema={[...formData?.parameters, ...(jsonSchemaToTreeNode(formData?.requestBody)?.children as [])]}
          />
        </div>
      </div>
      {data?.parameters && (
        <RjsfAntd
          formRef={refs.parametersRef}
          onSubmit={(data) => handleSubmit(data, 'parameters')}
          schema={injectDefaults(getSchema(data.parameters), formData?.metaExe?.parameters)}
          uiProps={{
            mentions: [...flattenSchemaToMentions(getSchema(formData.parameters)), ...flattenSchemaToMentions(formData.requestBody)]
          }}
        />
      )}
      {selectedMediaType && schema && (
        <RjsfAntd
          formRef={refs.requestBodyRef}
          onSubmit={(data) => handleSubmit(data, 'requestBody')}
          schema={injectDefaults(schema, formData?.metaExe?.requestBody)}
          uiProps={{
            mentions: [...flattenSchemaToMentions(getSchema(formData.parameters)), ...flattenSchemaToMentions(formData.requestBody)]
          }}
        />
      )}
      {apiResponses?.properties && (
        <>
          <div className="border border-gray-200  dark:border-gray-600 rounded">
            <div className="font-medium bg-gray-50 px-4 py-2">
              Responses comes from api2
            </div>
            <div className="divide-y divide-gray-100">
              <SchemaEditor
                mode={1}
                schemaType="responses"
                schema={jsonSchemaToTreeNode(apiResponses).children || []}
              />
            </div>
          </div>
          <div className="border border-gray-200  dark:border-gray-600 rounded">
            <div className="font-medium bg-gray-50 px-4 py-2">
              Responses comes from api1
            </div>
            <div className="divide-y divide-gray-100">
              <RjsfAntd
                formRef={refs.responsesRef}
                onSubmit={(data) => handleSubmit(data, 'responsesApiOne')}
                schema={injectDefaults(formData.responses || {}, formData.metaExe.responsesApiOne)}
                uiProps={{
                  mentions: flattenSchemaToMentions(apiResponses || {})
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
