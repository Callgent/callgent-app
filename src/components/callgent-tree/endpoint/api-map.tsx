import { Mentions } from 'antd'
import SchemaEditor from '../SchemaTree/SchemaEditor'
import { useEndpointStore } from '@/models/endpoint'
import { useSchemaTreeStore } from '../SchemaTree/store';

export default function ApiMap() {
  const { formData, setFormData } = useEndpointStore()
  const { paramsOptions, responsesOptions } = useSchemaTreeStore();
  return (
    <div className="space-y-4 mt-2 overflow-x-hidden border p-2 rounded">
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Code
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <Mentions
            prefix="{{"
            placeholder="Type {{ to mention…"
            defaultValue={formData?.metaExe?.code}
            onChange={(value) => { setFormData({ ...formData, metaExe: { ...formData?.metaExe, code: value } }) }}
            options={[...paramsOptions, ...responsesOptions]}
            rows={2}
          />
        </div>
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api1
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor mode={1} schemaType="params" />
        </div>
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload comes from api2
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <SchemaEditor mode={3} schemaType="params" />
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
          <SchemaEditor
            mode={3}
            schemaType="responses"
          />
        </div>
      </div>
    </div>
  )
}
