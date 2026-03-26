import React from 'react';
import { Box, Button } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/table/DataTable';
import PageHeader from '../components/common/PageHeader';
import { InvoiceStatusBadge } from '../components/common/StatusBadge';
import { useInvoiceStore } from '../store/invoiceStore';
import { Invoice } from '../types/invoice';
import dayjs from 'dayjs';

const docTypeLabel: Record<string, string> = {
  invoice: '請求書', delivery_note: '納品書', quotation: '見積書',
  purchase_order: '発注書', receipt: '領収書',
};

const InvoiceReceive: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const navigate = useNavigate();
  const receiveInvoices = invoices.filter((i) => i.type === 'receive');

  const columns: ColumnDef<Invoice, unknown>[] = [
    { accessorKey: 'invoiceNumber', header: '帳票番号', enableSorting: true },
    { accessorKey: 'docType', header: '種類', cell: ({ getValue }) => docTypeLabel[getValue() as string] ?? getValue() as string },
    { accessorKey: 'partnerName', header: '送付元', enableSorting: true },
    { accessorKey: 'totalAmount', header: '金額（税込）', enableSorting: true, cell: ({ getValue }) => `¥${(getValue() as number).toLocaleString()}` },
    { accessorKey: 'issueDate', header: '受信日', enableSorting: true, cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    { accessorKey: 'dueDate', header: '支払期限', cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    { accessorKey: 'status', header: 'ステータス', cell: ({ getValue }) => <InvoiceStatusBadge status={getValue() as Invoice['status']} /> },
    {
      id: 'stamp', header: '押印',
      cell: ({ row }) => row.original.stampedAt
        ? <Box component="span" sx={{ color: 'success.main', fontSize: 12 }}>✓ 押印済み</Box>
        : <Box component="span" sx={{ color: 'text.disabled', fontSize: 12 }}>未押印</Box>,
    },
    {
      id: 'actions', header: '操作',
      cell: ({ row }) => (
        <Button size="small" variant="outlined" onClick={() => navigate(`/receive/${row.original.id}`)}>確認</Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="帳票受信管理"
        subtitle={`受信帳票 ${receiveInvoices.length} 件`}
        breadcrumbs={['ホーム', '帳票受信']}
      />
      <DataTable data={receiveInvoices} columns={columns} />
    </Box>
  );
};

export default InvoiceReceive;
