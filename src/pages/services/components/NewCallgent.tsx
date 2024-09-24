import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Switch, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';

const NewCallgent: React.FC = () => {
    const { modalOpen, initialValues, closeModal, openModal, saveCallgent } = useModel('services');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            await saveCallgent(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
        setLoading(false);
    };

    return (
        <>
            <Button onClick={() => openModal(null)}>New Callgent</Button>
            <Modal
                title={initialValues ? 'Edit Callgent' : 'Create a New Callgent'}
                centered
                open={modalOpen}
                onOk={handleOk}
                onCancel={closeModal}
                confirmLoading={loading}
                forceRender
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input placeholder="Enter Callgent name" />
                    </Form.Item>
                    <Form.Item
                        name="avatar"
                        label="Avatar"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e && e.fileList}
                    >
                        <Upload listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Enter description" />
                    </Form.Item>
                    <Form.Item
                        name="isPublic"
                        label="Public"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default NewCallgent;
