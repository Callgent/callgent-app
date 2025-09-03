import { Mentions } from 'antd'
import SchemaEditor from '../SchemaTree/schema-editor'
import { useEndpointStore } from '@/models/endpoint'

export default function ApiMap() {
  const { editId, apiMapId, formData, setFormData, schemaData, setSchemaData, responsesOptions } = useEndpointStore()
  // 更新
  const submitSchema = (data: any, form: string) => {
    setSchemaData((prevSchemaData: any) => ({
      ...prevSchemaData,
      [form]: data?.children || []
    }))
  }
  // 更新默认值
  const updateFormValue = (data: { id: string, name: string, value: any }, form: string) => {
    const { id, name, value } = data;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [form]: { ...(prevFormData[form] || {}), [`${id}`]: { [name]: value } }
    }));
  }
  return (
    <div className="space-y-4 mt-2 overflow-x-hidden border p-2 rounded">
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api1
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor
            mode={1}
            schemaType="parameters"
            schema={schemaData?.parameters}
            submitSchema={(data: any) => submitSchema(data, 'parameters')}
            setFormData={(data: any) => updateFormValue(data, 'parameters')}
            apiId={`${editId}_${apiMapId}`}
          />
          <SchemaEditor
            mode={1}
            schemaType="requestBody"
            schema={schemaData?.requestBody}
            submitSchema={(data: any) => submitSchema(data, 'requestBody')}
            setFormData={(data: any) => updateFormValue(data, 'requestBody')}
            apiId={`${editId}_${apiMapId}`}
          />
        </div>
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api2
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor
            mode={3}
            schemaType="parameters"
            schema={schemaData?.parameters2}
            submitSchema={(data: any) => submitSchema(data, 'parameters2')}
            setFormData={(data: any) => updateFormValue(data, 'parameters2')}
            apiId={`${editId}_${apiMapId}`}
          />
          <SchemaEditor
            mode={3}
            schemaType="requestBody"
            schema={schemaData?.requestBody2}
            submitSchema={(data: any) => submitSchema(data, 'requestBody2')}
            setFormData={(data: any) => updateFormValue(data, 'requestBody2')}
            apiId={`${editId}_${apiMapId}`}
          />
        </div>
      </div>
      <div className="border border-gray-200  dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50 px-4 py-2 bg-dark-green">
          Responses comes from api2
        </div>
        <div className="divide-y divide-gray-100">
          <SchemaEditor
            mode={1}
            schemaType="responses"
            schema={schemaData?.responses2}
            submitSchema={(data: any) => submitSchema(data, 'responses2')}
            setFormData={(data: any) => updateFormValue(data, 'responses2')}
            apiId={`${editId}_${apiMapId}`}
          />
        </div>
        <div className="font-medium bg-gray-50 px-4 py-2 bg-dark-green">
          Responses comes from api1
        </div>
        <div className="divide-y divide-gray-100">
          <div>
            <div className='border p-2 m-2'>
              <div className="font-medium bg-gray-50  px-4 py-2">
                statusCode
              </div>
              <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
                <Mentions
                  prefix="{{"
                  placeholder="Type {{ to mention…"
                  defaultValue={formData?.metaExe?.code}
                  onChange={(value) => { setFormData({ ...formData, metaExe: { ...formData?.metaExe, statusCode: value } }) }}
                  options={responsesOptions}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <SchemaEditor
            mode={3}
            schemaType="responses"
            schema={schemaData?.responses}
            submitSchema={(data: any) => submitSchema(data, 'responses')}
            setFormData={(data: any) => updateFormValue(data, 'responses')}
            apiId={`${editId}_${apiMapId}`}
          />
        </div>
      </div>
    </div>
  )
}
