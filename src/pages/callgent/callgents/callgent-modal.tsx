import { CallgentInfo } from "#/entity";
import { Form, Input, InputNumber, Modal, Radio } from "antd";
import { useEffect } from "react";

export type CallgentModalProps = {
  formValue: CallgentInfo;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};

export function CallgentModal({ title, show, formValue, onOk, onCancel }: CallgentModalProps) {
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
        <Form.Item label="Avatar" name="avatar">
          <Input />
        </Form.Item>
        <Form.Item label="Summary" name="summary">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Instruction" name="instruction">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Liked" name="liked">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Viewed" name="viewed">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Forked" name="forked">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Favorite" name="favorite">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Official" name="official">
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Featured" name="featured">
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Forked PK" name="forkedPk">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Main Tag ID" name="mainTagId">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Created By" name="createdBy">
          <Input />
        </Form.Item>
        <Form.Item label="Created At" name="createdAt">
          <Input />
        </Form.Item>
        <Form.Item label="Updated At" name="updatedAt">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
