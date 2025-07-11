import Form from '@rjsf/antd'
import validator from '@rjsf/validator-ajv8'
import { getSchema } from './util'
import { useEndpointStore } from '@/models/endpoint'
import { useEffect, useState } from 'react'
import { Select } from 'antd'
import JSONSchemaEditor from './schema-editor'

export default function SchemaEditorForm({ data, responses }: any) {
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
      apiMap: {
        ...formData?.apiMap,
        [type]: form.formData
      }
    })
  }

  const schema = selectedMediaType && data?.requestBody?.content?.[selectedMediaType]?.schema

  return (
    <div className="space-y-4 mt-2 max-h-[500px] overflow-x-hidden border p-2 rounded">
      {data?.parameters && (
        <Form
          schema={getSchema(data.parameters)}
          validator={validator}
          onChange={(data) => handleSubmit(data, 'parameters')}
          uiSchema={{
            'ui:submitButtonOptions': { norender: true },
          }}
        />
      )}

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

      {selectedMediaType && schema && (
        <Form
          schema={schema}
          validator={validator}
          onChange={(data) => handleSubmit(data, 'requestBody')}
          uiSchema={{
            'ui:submitButtonOptions': { norender: true },
          }}
        />
      )}

      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api1
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <JSONSchemaEditor mode={1} schemaType="params" />
        </div>
      </div>
      <div className="border border-gray-200  dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50 px-4 py-2">
          Responses comes from api1
        </div>
        <div className="divide-y divide-gray-100">
          <JSONSchemaEditor mode={1} schemaType="responses" />
        </div>
      </div>

      {responses?.properties && (
        <Form
          schema={responses}
          validator={validator}
          onChange={(data) => handleSubmit(data, 'responses')}
          uiSchema={{
            'ui:submitButtonOptions': { norender: true },
          }}
        />
      )}
    </div>
  )
}
