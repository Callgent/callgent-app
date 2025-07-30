import { Mentions } from 'antd'
import SchemaEditor from '../SchemaTree/SchemaEditor'
import { useEndpointStore } from '@/models/endpoint'
import { useSchemaTreeStore } from '../SchemaTree/store';

export default function ApiMap() {
  const { formData, setFormData } = useEndpointStore()
  const { responsesOptions } = useSchemaTreeStore();
  return (
    <div className="space-y-4 mt-2 overflow-x-hidden border p-2 rounded">
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api1
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor mode={1} schemaType="parameters" />
          <SchemaEditor mode={1} schemaType="requestBody" />
        </div>
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api2
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor mode={3} schemaType="parameters" />
          <SchemaEditor mode={3} schemaType="requestBody" />
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
          />
        </div>
      </div>
    </div>
  )
}
