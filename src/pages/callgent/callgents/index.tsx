import useCallgentStore, { useCallgentActions } from "@/models/callgentStore";
import { useFetchCallgentList } from "@/models/callgentStore";
import { Button, Card, Col, Form, Input, Row, Select, Space } from "antd";
import { useState } from "react";
import type { CallgentInfo } from "#/entity";
import CallgentList from "./callgent-list";
import { CallgentModal, type CallgentModalProps } from "./callgent-modal";

export default function Callgents() {
  const { setSearchInfo, setPageInfo, reset } = useCallgentActions();
  const fetchCallgentList = useFetchCallgentList();
  const [searchForm] = Form.useForm();

  const [CallgentModalPros, setCallgentModalProps] = useState<CallgentModalProps>({
    formValue: { name: "" },
    title: "New",
    show: false,
    onOk: () => {
      setCallgentModalProps((prev) => ({ ...prev, show: false }));
    },
    onCancel: () => {
      setCallgentModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const onCreate = () => {
    setCallgentModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Create New"
    }));
  };

  const onEdit = (formValue: CallgentInfo) => {
    setCallgentModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  // Reset
  const onSearchFormReset = async () => {
    reset();
    searchForm.resetFields();
    await fetchCallgentList({})
  };

  // search
  const { perPage } = useCallgentStore(state => state.pageInfo);
  const onSearch = async () => {
    const values = searchForm.getFieldsValue();
    setSearchInfo(values);
    setPageInfo({ page: 1, perPage });
    await fetchCallgentList({ page: 1, perPage, ...values });
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item label="callgent" name="query" className="!mb-0">
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

      <CallgentModal {...CallgentModalPros} />
    </Space>
  );
}
