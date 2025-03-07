import { useDeleteCallgent } from '@/store/callgentStore';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Avatar, Card, Popconfirm, Rate, Typography } from 'antd';
import type React from 'react';
import { useState } from 'react';
import type { CallgentInfo } from '#/entity';
import { useNavigate } from 'react-router';

const { Paragraph } = Typography;

interface CallgentCardProps {
  item: CallgentInfo;
  onEdit: (item: CallgentInfo) => void;
}

const CallgentCard: React.FC<CallgentCardProps> = ({ item, onEdit }) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();

  const showPopconfirm = () => {
    setOpenConfirm(true);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  // del callgent
  const delCallgent = useDeleteCallgent()
  const deleteCallgent = async () => {
    setConfirmLoading(true);
    try {
      await delCallgent(item.id!);
    } finally {
      setConfirmLoading(false);
      setOpenConfirm(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/callgent/tree?callgentId=${item.id}`);
  };

  return (
    <Card
      className="max-w[500] min-w-[300] w-full"
      actions={[
        <EditOutlined key="edit" onClick={() => onEdit(item)} />,
        <Rate key="viewed" count={1} defaultValue={item.viewed} />,
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this item ?"
          open={openConfirm}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handleCancel}
          onConfirm={deleteCallgent}
        >
          <DeleteOutlined onClick={showPopconfirm} />
        </Popconfirm>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar onClick={handleCardClick} className='cursor-pointer' src={item.avatar || '/images/avatar.svg'} />}
        title={<div onClick={handleCardClick} className='cursor-pointer'>{item.name}</div>}
        description={
          <div onClick={handleCardClick} className='cursor-pointer'>
            <Paragraph ellipsis>{item.summary || 'no description'}</Paragraph>
            <span>{item.updatedAt?.split('T')[0]}</span>
          </div>
        }
      />
    </Card>
  );
};

export default CallgentCard;
