import React from 'react'
import { Modal, Form, Input, Select, Checkbox } from 'antd'
import { typeOptions } from './utils'
import type { SchemaModalProps } from './types'

const fieldsConfig: Record<string, string[]> = {
    parameters: ['name', 'in', 'type', 'default', 'required', 'description'],
    requestBody: ['name', 'type', 'default', 'required', 'description'],
    responses: ['name', 'type', 'default', 'description'],
}

function SchemaDetailModal({ visible, mode, schemaType, onCancel, onOk, initialValues }: SchemaModalProps) {
    const [form] = Form.useForm()
    React.useEffect(() => {
        form.setFieldsValue(initialValues)
    }, [initialValues])

    const onFinish = (vals: any) => onOk(vals)

    // 当前模式下哪些字段可编辑
    const editable = (field: string) => {
        if (mode === 1) return false
        if (mode === 3) return field === 'default'
        return true
    }
    return (
        <Modal
            open={visible}
            title="字段详情"
            onOk={() => form.validateFields().then(onFinish)}
            onCancel={onCancel}
            okButtonProps={{ disabled: mode === 1 }}
        >
            <Form form={form} layout="vertical" initialValues={initialValues}>
                {fieldsConfig[schemaType].map(field => {
                    switch (field) {
                        case 'name':
                            return (
                                <Form.Item
                                    key="name"
                                    name="name"
                                    label="字段名"
                                    rules={[{ required: true }]}
                                >
                                    <Input disabled={!editable('name')} />
                                </Form.Item>
                            )
                        case 'in':
                            if (initialValues?.__parent?.id !== 'root') {
                                return null
                            }
                            return (
                                <Form.Item key="in" name="in" label="位置">
                                    <Select
                                        options={[
                                            { label: 'query', value: 'query' },
                                            { label: 'path', value: 'path' },
                                            { label: 'header', value: 'header' }
                                        ]}
                                        disabled={!editable('in')}
                                    />
                                </Form.Item>
                            )
                        case 'type':
                            return (
                                <Form.Item
                                    key="type"
                                    name="type"
                                    label="类型"
                                    rules={[{ required: true, message: '请选择类型' }]}
                                >
                                    <Select
                                        options={typeOptions.map((item) => ({ label: item, value: item }))}
                                        disabled={!editable('type')}
                                    />
                                </Form.Item>
                            )
                        case 'required':
                            return (
                                <Form.Item
                                    key="required"
                                    name="required"
                                    valuePropName="checked"
                                >
                                    <Checkbox disabled={!editable('required')}>必填</Checkbox>
                                </Form.Item>
                            )
                        case 'default':
                            return (
                                <Form.Item
                                    key="default"
                                    name="default"
                                    label="默认值"
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator() {
                                                if (!getFieldValue('required') && !getFieldValue('default')) {
                                                    return Promise.reject(
                                                        new Error('请设置默认值')
                                                    )
                                                }
                                                return Promise.resolve()
                                            },
                                        }),
                                    ]}
                                >
                                    <Input disabled={!editable('default')} />
                                </Form.Item>
                            )
                        case 'description':
                            return (
                                <Form.Item key="description" name="description" label="描述">
                                    <Input.TextArea
                                        rows={3}
                                        disabled={!editable('description')}
                                    />
                                </Form.Item>
                            )
                        default:
                            return null
                    }
                })}
            </Form>
        </Modal>
    )
}

export default React.memo(SchemaDetailModal, (prev, next) => { return (prev === next) })