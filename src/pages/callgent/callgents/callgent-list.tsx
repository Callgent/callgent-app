import { useEffect } from "react";
import { useFetchCallgentList, useCallgentList } from "@/store/callgentStore";
import { Col, Row } from "antd";
import CallgentCard from "./callgent-card";
import { CallgentInfo } from "#/entity";

interface CallgentListComponentProps {
  onEdit: (data: CallgentInfo) => void;
}

const CallgentListComponent: React.FC<CallgentListComponentProps> = ({ onEdit }) => {
  const fetchCallgentList = useFetchCallgentList();
  const callgentList = useCallgentList();

  useEffect(() => {
    fetchCallgentList();
  }, []);

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
    </div>
  );
};

export default CallgentListComponent;
