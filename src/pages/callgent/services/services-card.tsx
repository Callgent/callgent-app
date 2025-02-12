import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Avatar, Card, Popconfirm, Rate, Typography } from 'antd';
import type React from 'react';
import { useState } from 'react';
import type { CallgentInfo } from '#/entity';

const { Paragraph } = Typography;

interface CallgentCardProps {
  item: CallgentInfo;
  onEdit: (item: CallgentInfo) => void;
}

const ServicesCard: React.FC<CallgentCardProps> = ({
  item,
  onEdit
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmLoading] = useState(false);

  const showPopconfirm = () => {
    setOpenConfirm(true);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  return (
    <Card
      actions={[
        <EditOutlined key="edit" onClick={() => onEdit(item)} />,
        <Rate key="viewed" count={1} defaultValue={item.viewed} />,
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this item ?"
          open={openConfirm}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handleCancel}
        >
          <DeleteOutlined onClick={showPopconfirm} />
        </Popconfirm>,
      ]}
      style={{ maxWidth: 500, minWidth: 300, width: '100%' }}
    >
      <Card.Meta
        avatar={<Avatar src={item.avatar || '/images/avatar.svg'} />}
        title={item.name}
        description={
          <>
            <Paragraph ellipsis>{item.summary || 'no description'}</Paragraph>
            <span>{item.updatedAt?.split('T')[0]}</span>
          </>
        }
      />
    </Card>
  );
};

export default ServicesCard;
