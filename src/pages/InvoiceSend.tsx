import React from 'react';
import { Box, Button } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
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

const InvoiceSend: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const navigate = useNavigate();
  const sendInvoices = invoices.filter((i) => i.type === 'send');

  const columns: ColumnDef<Invoice, unknown>[] = [
    { accessorKey: 'invoiceNumber', header: '帳票番号', enableSorting: true },
    { accessorKey: 'docType', header: '種類', cell: ({ getValue }) => docTypeLabel[getValue() as string] ?? getValue() as string },
    { accessorKey: 'partnerName', header: '取引先', enableSorting: true },
    { accessorKey: 'totalAmount', header: '金額（税込）', enableSorting: true, cell: ({ getValue }) => `¥${(getValue() as number).toLocaleString()}` },
    { accessorKey: 'issueDate', header: '発行日', enableSorting: true, cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    { accessorKey: 'dueDate', header: '支払期限', cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    { accessorKey: 'status', header: 'ステータス', cell: ({ getValue }) => <InvoiceStatusBadge status={getValue() as Invoice['status']} /> },
    {
      id: 'actions', header: '操作',
      cell: ({ row }) => (
        <Button size="small" variant="outlined" onClick={() => navigate(`/receive/${row.original.id}`)}>詳細</Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="帳票送信管理"
        subtitle={`送信帳票 ${sendInvoices.length} 件`}
        breadcrumbs={['ホーム', '帳票送信']}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/send/new')}>新規送信</Button>
        }
      />
      <DataTable data={sendInvoices} columns={columns} />
    </Box>
  );
};

export default InvoiceSend;
