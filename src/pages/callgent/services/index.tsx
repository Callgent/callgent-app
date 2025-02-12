import { useCallgentActions, usePageInfo } from "@/store/callgentStore";
import { useFetchCallgentList } from "@/store/callgentStore";
import { Button, Card, Col, Form, Input, Row, Select, Space } from "antd";
import { useState } from "react";
import type { CallgentInfo } from "#/entity";
import CallgentList from "./services-list";
import { type CallgentModalProps, ServicesModal } from "./services-modal";

export default function Services() {
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

  const { setSearchInfo, setPageInfo } = useCallgentActions();
  const fetchCallgentList = useFetchCallgentList();

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

  const onSearchFormReset = () => {
    searchForm.resetFields();
    console.log("Form reset", searchForm.getFieldsValue());
  };

  const pageInfo = usePageInfo();
  const onSearch = async () => {
    const values = searchForm.getFieldsValue();
    setSearchInfo(values);
    setPageInfo({ ...pageInfo, page: 1 })
    await fetchCallgentList({
      ...values,
      page: 1,
      perPage: 12,
    });
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item label="Services" name="query" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item label="Adaptor" name="adaptor" className="!mb-0">
                <Select placeholder="Select adaptor">
                  <Select.Option value="restAPI">restAPI</Select.Option>
                  <Select.Option value="Webpage">Webpage</Select.Option>
                  <Select.Option value="Email">Email</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={12}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>Reset</Button>
                <Button type="primary" className="ml-4" onClick={onSearch}>
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="Services List">
        <CallgentList onEdit={onEdit} />
      </Card>

      <ServicesModal {...organizationModalPros} />
    </Space>
  );
}
