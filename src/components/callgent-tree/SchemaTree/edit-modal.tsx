import React from 'react'
import { Modal, Form, Input, Select, Checkbox } from 'antd'

interface DetailModalProps {
    visible: boolean
    mode: 1 | 2 | 3
    schemaType: 'responses' | 'params'
    onCancel: () => void
    onOk: (values: any) => void
    initialValues: any
}

const fieldsConfig: Record<string, string[]> = {
    params: ['name', 'in', 'required', 'default', 'description'],
    responses: ['name', 'default', 'description'],
}

export default function SchemaDetailModal({
    visible,
    mode,
    schemaType,
    onCancel,
    onOk,
    initialValues,
}: DetailModalProps) {
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
                            return (
                                <Form.Item key="in" name="in" label="位置">
                                    <Select
                                        options={[
                                            { label: 'query', value: 'query' },
                                            { label: 'path', value: 'path' },
                                            { label: 'header', value: 'header' },
                                            { label: 'body', value: 'body' },
                                        ]}
                                        disabled={!editable('in')}
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
