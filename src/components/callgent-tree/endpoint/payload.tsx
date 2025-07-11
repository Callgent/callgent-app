import { useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import { Button, Form, Input, InputRef, Modal, Select } from 'antd'
import { useEndpointStore } from '@/models/endpoint'
import useTreeActionStore from '@/models/callgentTreeStore'
import JSONSchemaEditor from './schema-editor'
import { requestMethods } from './util'

export default function Payload() {
  const {
    status,
    endpointName,
    whatFor,
    setIsEndpointOpen,
    setWhatFor,
    setEndpointName,
    isEndpointOpen,
    formData,
    setFormData
  } = useEndpointStore()

  const [formEndpoint] = Form.useForm()
  const { currentNode } = useTreeActionStore()

  const inputRef = useRef<InputRef>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          defaultValue="mysite"
          value={endpointName}
          onChange={(e) => setEndpointName(e.target.value)}
          placeholder="Please enter endpoint name starting with /"

        />
        <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300" onClick={() => setIsEndpointOpen(true)}>
          <Icon icon="solar:settings-bold" className="w-5 h-5 " />
        </button>
      </div>

      {/* Description */}
      {currentNode?.type === 'CLIENT' && (
        <div className='my-2'>
          <label className="block font-medium mb-2">whatFor</label>
          <Input.TextArea rows={2} value={whatFor} onChange={(e) => setWhatFor(e.target.value)} placeholder='Explain to caller, when and how to use this endpoint' />
        </div>
      )}

      {/* Parameters */}
      <div className="border border-gray-200 dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50  px-4 py-2">
          Payload
        </div>
        <div className="divide-y divide-gray-100 border-t dark:border-t-gray-600">
          <JSONSchemaEditor mode={status === 'read_only' ? 1 : 2} schemaType="params" />
        </div>
      </div>
      <div className="border border-gray-200  dark:border-gray-600 rounded">
        <div className="font-medium bg-gray-50 px-4 py-2">
          Responses
        </div>
        <div className="divide-y divide-gray-100">
          <JSONSchemaEditor mode={status === 'read_only' ? 1 : 2} schemaType="responses" />
        </div>
      </div>
      <Modal
        title="Endpoint Settings"
        open={isEndpointOpen}
        onCancel={() => setIsEndpointOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsEndpointOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              formEndpoint.validateFields().then(values => {
                setFormData({ ...formData, endpoint: values })
                setIsEndpointOpen(false)
              })
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </Button>
        ]}
      >
        <Form form={formEndpoint} layout="vertical" initialValues={formData.endpoint}>
          <Form.Item name="method" label="HTTP Method" rules={[{ required: true }]}>
            <Select className="w-full" options={requestMethods.map((item) => ({
              value: item.value,
              label: (
                <div className="flex justify-between items-center mr-4" >
                  <span>{item.value} </span>
                  <span className="text-gray-600 text-sm" > {item.description} </span>
                </div>
              ),
            }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
