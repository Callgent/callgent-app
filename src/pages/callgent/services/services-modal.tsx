import { Form, Input, Modal } from "antd";
import { useEffect } from "react";
import type { CallgentInfo } from "#/entity";

export type CallgentModalProps = {
  formValue: CallgentInfo;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};

export function ServicesModal({ title, show, formValue, onOk, onCancel }: CallgentModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  return (
    <Modal title={title} open={show} onOk={onOk} onCancel={onCancel} height={500}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item label="Name" name="name" required>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
