import { Form, Input, Modal } from "antd";
import { useState, useEffect } from "react";
import type { CallgentInfo } from "#/entity";
import { useCreateCallgent, useUpdateCallgent } from "@/models/callgentStore";

export function CallgentModal({ title, show, formValue, onOk, onCancel }: CallgentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValue);
  }, [formValue, form]);

  const createCallgent = useCreateCallgent()
  const updateCallgent = useUpdateCallgent()
  const submit = async () => {
    const values = form.getFieldsValue();
    setLoading(true);
    try {
      if (formValue.id) {
        await updateCallgent(formValue.id, values)
      } else {
        await createCallgent(values);
      }
    } finally {
      setLoading(false);
      onOk();
    }
  };

  return (
    <Modal
      title={title}
      open={show}
      onOk={submit}
      onCancel={onCancel}
      okButtonProps={{ loading }}
      forceRender
    >
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item label="Name" name="name" required>
          <Input />
        </Form.Item>
        <Form.Item label="whatFor" name="whatFor" rules={[{ required: false, message: 'Please describe the purpose of this Callgent' }]}>
          <Input.TextArea placeholder="Describe the purpose of this Callgent (e.g., its function or goal)" />
        </Form.Item>
        <Form.Item label="how2Use" name="how2Ops" rules={[{ required: false, message: 'Please explain how to use this Callgent' }]}>
          <Input.TextArea placeholder="Provide usage instructions for this Callgent (e.g., steps to operate it)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export type CallgentModalProps = {
  formValue: CallgentInfo;
  title: string;
  show: boolean;
  onOk: () => void;
  onCancel: () => void;
};
