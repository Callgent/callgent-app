import CallgentList from "./callgent-list";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import { useState } from "react";
import type { CallgentInfo, Organization } from "#/entity";
import { CallgentModal, CallgentModalProps } from "./callgent-modal";

type SearchFormFieldType = Pick<Organization, "name" | "status">;

export default function Callgents() {
  const [searchForm] = Form.useForm();
  const [organizationModalPros, setOrganizationModalProps] = useState<CallgentModalProps>({
    formValue: {
      id: "",
      name: "",
      liked: 0,
      viewed: 0,
      featured: true,
      favorite: 0,
      forked: 0,
      official: true
    },
    title: "New",
    show: false,
    onOk: () => {
      setOrganizationModalProps((prev) => ({ ...prev, show: false }));
    },
    onCancel: () => {
      setOrganizationModalProps((prev) => ({ ...prev, show: false }));
    },
  });


  const onSearchFormReset = () => {
    searchForm.resetFields();
  };

  const onCreate = () => {
    setOrganizationModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Create New",
      formValue: {
        ...prev.formValue,
        name: "",
        liked: 0,
        viewed: 0,
        featured: true,
        favorite: 0,
        forked: 0,
        official: true
      },
    }));
  };

  const onEdit = (formValue: CallgentInfo) => {
    setOrganizationModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={12}>
              <Form.Item<SearchFormFieldType> label="callgent" name="name" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={12}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>Reset</Button>
                <Button type="primary" className="ml-4">
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="Callgent List"
        extra={
          <Button type="primary" onClick={onCreate}>
            New
          </Button>
        }
      >
        <CallgentList onEdit={onEdit} />
      </Card>

      <CallgentModal {...organizationModalPros} />
    </Space>
  );
}



