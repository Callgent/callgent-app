import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { transactions } from '@/api/services/billing';

interface DetailItem {
  key: string;
  id: string;
  cost: number;
  callgent: string;
}

interface ApiItem extends DetailItem {
  children?: DetailItem[];
}

interface CallItem extends ApiItem {
  timestamp: string;
  children?: ApiItem[];
}

const columns: TableColumnsType<CallItem | ApiItem | DetailItem> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Cost ($)',
    dataIndex: 'cost',
    key: 'cost',
    render: (text) => Number(text)?.toFixed(2),
  },
  {
    title: 'Callgent',
    dataIndex: 'callgent',
    key: 'callgent',
    render: (text) => text || '-',
  },
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (text) => text || '-',
  },
];

const BillingTable: React.FC = () => {
  const [data, setData] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await transactions();
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    setData([
      {
        key: 'call-001',
        id: 'Call Record #001',
        cost: 1.32,
        callgent: '-',
        timestamp: '2025-04-20 10:01',
        children: [
          {
            key: 'api-002',
            id: 'getTransactionList',
            cost: 0.57,
            callgent: 'transactionService.getList',
            children: [
              {
                key: 'detail-003',
                id: 'Params: userId=123&limit=10',
                cost: 0.57,
                callgent: '-',
              },
            ],
          },
        ],
      },
      {
        key: 'call-002',
        id: 'Call Record #002',
        cost: 2.10,
        callgent: '-',
        timestamp: '2025-04-20 11:15',
        children: [
          {
            key: 'api-003',
            id: 'fetchOrders',
            cost: 2.10,
            callgent: 'orderService.fetchOrders',
          },
        ],
      },
    ]);
  }, []);

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      expandable={{ defaultExpandAllRows: false }}
      rowKey="key"
    />
  );
};

export default BillingTable;
