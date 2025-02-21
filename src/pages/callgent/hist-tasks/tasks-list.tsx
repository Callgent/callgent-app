import useCallgentStore, { useCallgentActions, useFetchCallgentTasks } from "@/store/callgentStore";
import { Col, Pagination, Row } from "antd";
import { useEffect, useState } from "react";
import CallgentCard from "./tasks-card";

const TasksListComponent: React.FC = () => {
  const { callgentList, pageInfo, searchInfo } = useCallgentStore()
  const { perPage, page, total } = pageInfo;
  const fetchCallgentList = useFetchCallgentTasks();
  const { reset } = useCallgentActions();
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setCurrentPage(page)
  }, [page])

  const init = () => {
    reset();
    setLoading(true);
    fetchCallgentList({ page, perPage, ...searchInfo }).finally(() => {
      setLoading(false);
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
    fetchCallgentList({ page, perPage, ...searchInfo }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Row gutter={[24, 24]} justify="start">
        {callgentList.map((item) => (
          <Col key={item.id} xs={24} md={12} lg={12} xl={8} xxl={6}>
            <CallgentCard
              item={item}
            />
          </Col>
        ))}
      </Row>

      <div className="w-full flex justify-center mt-8">
        <Pagination
          current={currentPage}
          pageSize={perPage}
          total={total}
          onChange={handlePageChange}
          showSizeChanger={false}
          hideOnSinglePage={true}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default TasksListComponent;
