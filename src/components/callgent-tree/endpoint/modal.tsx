import { Modal, Input, Select, Form, Button, Checkbox } from 'antd'
import { fieldTypes, requestLocations, requestMethods } from './util'
import { useEndpointStore } from '@/models/endpoint'

export default function EndpointModal() {
  const {
    addParameter, updateParameter, removeParameter, removeResponse,
    addResponse, updateResponse,
    isParameterOpen, setIsParameterOpen,
    isResponseOpen, setIsResponseOpen,
    isEndpointOpen, setIsEndpointOpen,
    formData, setFormData,
    editIndex, setEditIndex,
  } = useEndpointStore()

  const [formParameter] = Form.useForm()
  const [formResponse] = Form.useForm()
  const [formEndpoint] = Form.useForm()

  return (
    <>
      {/* Endpoint Settings Modal */}
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
        <Form form={formEndpoint} layout="vertical" initialValues={{ ...formData.endpoint, method: 'GET' }}>
          <Form.Item name="method" label="HTTP Method" rules={[{ required: true }]}>
            <Select className="w-full" options={requestMethods} />
          </Form.Item>
          <Form.Item name="how2exe" label="how2exe">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Parameter Modal */}
      <Modal
        title={editIndex !== -1 ? 'Edit Parameter' : 'Add Parameter'}
        open={isParameterOpen}
        onCancel={() => {
          setEditIndex(-1)
          setIsParameterOpen(false)
        }}
        footer={[
          editIndex !== -1 && (
            <Button
              key="delete"
              danger
              onClick={() => {
                removeParameter(editIndex)
                setEditIndex(-1)
                setIsParameterOpen(false)
                formParameter.resetFields()
              }}
              className="mr-auto"
            >
              Delete
            </Button>
          ),
          <Button
            key="cancel"
            onClick={() => {
              setEditIndex(-1)
              setIsParameterOpen(false)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              formParameter.validateFields().then(values => {
                if (editIndex !== -1) {
                  updateParameter(editIndex, values)
                } else {
                  addParameter(values)
                }
                setFormData({ ...formData, parameter: values })
                setEditIndex(-1)
                formParameter.resetFields()
                setIsParameterOpen(false)
              })
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </Button>
        ]}
      >
        <Form form={formParameter} layout="vertical" initialValues={{ ...formData.parameter, location: 'body', type: 'string' }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="location" rules={[{ required: true }]}>
            <Select options={requestLocations} />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={fieldTypes} />
          </Form.Item>
          <Form.Item name="describe" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="default" label="Default Value">
            <Input />
          </Form.Item>
          <Form.Item name="required" valuePropName="checked">
            <Checkbox>Required</Checkbox>
          </Form.Item>
        </Form>

      </Modal>

      {/* Response Modal */}
      <Modal
        title={editIndex !== -1 ? 'Edit Response' : 'Add Response'}
        open={isResponseOpen}
        onCancel={() => {
          setEditIndex(-1)
          setIsResponseOpen(false)
        }}
        footer={[
          editIndex !== -1 && (
            <Button
              key="delete"
              danger
              onClick={() => {
                removeResponse(editIndex)
                setEditIndex(-1)
                setIsResponseOpen(false)
                formResponse.resetFields()
              }}
              className="mr-auto"
            >
              Delete
            </Button>
          ),
          <Button
            key="cancel"
            onClick={() => {
              setEditIndex(-1)
              setIsResponseOpen(false)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              formResponse.validateFields().then(values => {
                if (editIndex !== -1) {
                  updateResponse(editIndex, values)
                } else {
                  addResponse(values)
                }
                setFormData({ ...formData, response: values })
                setEditIndex(-1)
                formResponse.resetFields()
                setIsResponseOpen(false)
              })
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </Button>
        ]}
      >
        <Form form={formResponse} layout="vertical" initialValues={{ ...formData.response, type: 'string' }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={fieldTypes} />
          </Form.Item>
          <Form.Item name="describe" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="default" label="Default Value">
            <Input />
          </Form.Item>
          <Form.Item name="required" valuePropName="checked">
            <Checkbox>Required</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
