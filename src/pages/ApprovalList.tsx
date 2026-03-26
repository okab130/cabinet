import React from 'react';
import { Box, Button } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/table/DataTable';
import PageHeader from '../components/common/PageHeader';
import { ApprovalStatusBadge } from '../components/common/StatusBadge';
import { useInvoiceStore } from '../store/invoiceStore';
import { ApprovalRequest } from '../types/approval';
import dayjs from 'dayjs';

const ApprovalList: React.FC = () => {
  const { approvals } = useInvoiceStore();
  const navigate = useNavigate();

  const columns: ColumnDef<ApprovalRequest, unknown>[] = [
    { accessorKey: 'title', header: 'タイトル', enableSorting: true },
    { accessorKey: 'requesterName', header: '申請者' },
    { accessorKey: 'type', header: '種別', cell: ({ getValue }) => getValue() === 'invoice_send' ? '送信承認' : '受信確認' },
    {
      id: 'step', header: '進捗',
      cell: ({ row }) => `${row.original.currentStepIndex + 1} / ${row.original.steps.length} ステップ`,
    },
    { accessorKey: 'status', header: 'ステータス', cell: ({ getValue }) => <ApprovalStatusBadge status={getValue() as ApprovalRequest['status']} /> },
    { accessorKey: 'createdAt', header: '申請日', enableSorting: true, cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    { accessorKey: 'updatedAt', header: '更新日', cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    {
      id: 'actions', header: '操作',
      cell: () => (
        <Button size="small" variant="outlined" onClick={() => navigate('/approval')}>詳細</Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="承認申請一覧" subtitle={`全 ${approvals.length} 件`} breadcrumbs={['ホーム', '承認フロー', '申請一覧']} />
      <DataTable data={approvals} columns={columns} />
    </Box>
  );
};

export default ApprovalList;
