import React, { useState, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Row, Col, Input, Empty, Typography, Button } from 'antd';
import NewCallgent from '../components/NewCallgent';
import { useModel } from '@umijs/max';
import CallgentCard from '../components/CallgentCard';
import debounce from 'lodash/debounce';

const MyCallgent: React.FC = () => {
  const { callgents, loading, fetchCallgents, removeCallgent, openModal } = useModel('services');
  const [query, setQuery] = useState<string>();

  const debouncedFetchCallgents = useCallback(
    debounce((value: string) => {
      fetchCallgents(value);
    }, 600),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchCallgents(value);
  };

  return (
    <PageContainer
      loading={loading}
      header={{
        extra: [
          <Input
            key="search"
            value={query}
            onChange={handleSearchChange}
            allowClear
            placeholder="Search Callgent"
          />,
          <NewCallgent key="NewCallgent" />,
        ],
      }}
    >
      <Row gutter={[24, 24]} justify="start">
        {callgents.map((item) => (
          <Col key={item.id} xs={24} md={12} lg={12} xl={8} xxl={6}>
            <CallgentCard
              item={item}
              onEdit={() => openModal(item)}
              removeCallgent={removeCallgent}
            />
          </Col>
        ))}
      </Row>
      {callgents.length <= 0 && (
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 60 }}
          description={
            <Typography.Text>
              Create a new callgent
            </Typography.Text>
          }
        >
          <Button type="primary" onClick={() => openModal()}>Create Now</Button>
        </Empty>
      )}
    </PageContainer>
  );
};

export default MyCallgent;
