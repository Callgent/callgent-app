import { Avatar, Card, Rate, Tooltip, Typography } from 'antd';
import type React from 'react';
import type { CallgentInfo } from '#/entity';

const { Paragraph } = Typography;

interface CallgentCardProps {
  item: CallgentInfo;
}

const ServicesCard: React.FC<CallgentCardProps> = ({ item }) => {

  return (
    <Card
      className="max-w[500] min-w-[300] w-full"
      actions={[
        <Rate key="viewed" count={1} defaultValue={item.viewed} />
      ]}
    >
      <Card.Meta
        avatar={<Avatar src={item.avatar || '/images/avatar.svg'} />}
        title={item.name}
        description={
          <>
            <Tooltip title={item.summary || 'No description available'}>
              <Paragraph
                className="line-clamp-2"
                ellipsis={{ rows: 2, expandable: false }}
              >
                {item.summary || 'No description available'}
              </Paragraph>
            </Tooltip>
            <span>{item.updatedAt?.split('T')[0]}</span>
          </>
        }
      />
    </Card>
  );
};

export default ServicesCard;
