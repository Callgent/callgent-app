import React, { useState } from 'react';
import { Card, Avatar, Typography, Rate, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface CallgentCardProps {
    item: API.Callgent;
    onEdit: (item: API.Callgent) => void;
    removeCallgent: (id: string) => Promise<void>;
}

const CallgentCard: React.FC<CallgentCardProps> = ({
    item,
    onEdit,
    removeCallgent,
}) => {
    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showPopconfirm = () => {
        setOpenConfirm(true);
    };

    const handleOk = async () => {
        setConfirmLoading(true);

        try {
            await removeCallgent(item.id!);
        } catch (error) {
        } finally {
            setOpenConfirm(false);
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        setOpenConfirm(false);
    };

    return (
        <Card
            actions={[
                <EditOutlined key="edit" onClick={() => onEdit(item)} />,
                <Rate key="collect" count={1} defaultValue={item?.collect} />,
                <Popconfirm
                    key="delete"
                    title="Are you sure you want to delete this item ?"
                    open={openConfirm}
                    onConfirm={handleOk}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={handleCancel}
                >
                    <DeleteOutlined onClick={showPopconfirm} />
                </Popconfirm>,
            ]}
            style={{ maxWidth: 500, minWidth: 300, width: '100%' }}
        >
            <Card.Meta
                avatar={
                    <Avatar
                        src={item.avatar || 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'}
                    />
                }
                title={item.name}
                description={
                    <>
                        <Paragraph ellipsis>{item.description || 'no description'}</Paragraph>
                        <span>{item.updatedAt?.split('T')[0]}</span>
                    </>
                }
            />
        </Card>
    );
};

export default CallgentCard;
