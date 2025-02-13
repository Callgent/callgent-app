import { useCallgentActions, useFetchCallgentServerList, usePageInfo } from "@/store/callgentStore";
import { Button, Card, Col, Form, Input, Row, Select, Space } from "antd";
import CallgentList from "./services-list";

export default function Callgents() {
  const { setSearchInfo, setPageInfo, reset } = useCallgentActions();
  const fetchCallgentList = useFetchCallgentServerList();
  const [searchForm] = Form.useForm();

  // Reset
  const onSearchFormReset = async () => {
    reset();
    searchForm.resetFields();
    await fetchCallgentList({})
  };

  // search
  const { perPage } = usePageInfo();
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

      <Card title="Callgent List">
        <CallgentList />
      </Card>
    </Space>
  );
}
