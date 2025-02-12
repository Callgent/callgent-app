import { useCallgentActions, useCallgentList, useFetchCallgentServerList, usePageInfo, useSearchInfo } from "@/store/callgentStore";
import { Col, Pagination, Row } from "antd";
import { useEffect, useState } from "react";
import type { CallgentInfo } from "#/entity";
import CallgentCard from "./services-card";

interface CallgentListComponentProps {
  onEdit: (data: CallgentInfo) => void;
}

const ServicesListComponent: React.FC<CallgentListComponentProps> = ({ onEdit }) => {
  const fetchCallgentList = useFetchCallgentServerList();
  const callgentList = useCallgentList();
  const pageInfo = usePageInfo();  // 获取页码信息
  const searchInfo = useSearchInfo()
  const { reset } = useCallgentActions();
  const [currentPage, setCurrentPage] = useState(pageInfo.page);
  const pageSize = pageInfo.perPage;

  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    setCurrentPage(pageInfo.page)
  }, [pageInfo])
  const init = () => {
    reset();
    fetchCallgentList(pageInfo);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCallgentList({ ...pageInfo, ...searchInfo, page });
  };

  return (
    <div className="container mx-auto p-4">
      <Row gutter={[24, 24]} justify="start">
        {callgentList.map((item) => (
          <Col key={item.id} xs={24} md={12} lg={12} xl={8} xxl={6}>
            <CallgentCard
              item={item}
              onEdit={() => onEdit(item)}
            />
          </Col>
        ))}
      </Row>

      <div className="w-full flex justify-center mt-8">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={pageInfo.total}
          onChange={handlePageChange}
          showSizeChanger={false}
          hideOnSinglePage={true}
        />
      </div>
    </div>
  );
};

export default ServicesListComponent;
