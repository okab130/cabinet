import React from 'react';
import { Grid, Box, Typography, Card, CardContent } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ColumnDef } from '@tanstack/react-table';
import KpiCard from '../components/dashboard/KpiCard';
import BarChartWidget from '../components/dashboard/BarChartWidget';
import PieChartWidget from '../components/dashboard/PieChartWidget';
import DataTable from '../components/table/DataTable';
import PageHeader from '../components/common/PageHeader';
import { InvoiceStatusBadge } from '../components/common/StatusBadge';
import { useInvoiceStore } from '../store/invoiceStore';
import { dashboardKpi, monthlyData, statusData } from '../data/mockData';
import { Invoice } from '../types/invoice';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const pending = invoices.filter((i) => i.status === 'pending_approval' || i.status === 'received').slice(0, 5);

  const columns: ColumnDef<Invoice, unknown>[] = [
    { accessorKey: 'invoiceNumber', header: '帳票番号', enableSorting: true },
    { accessorKey: 'partnerName', header: '取引先', enableSorting: true },
    { accessorKey: 'totalAmount', header: '金額', cell: ({ getValue }) => `¥${(getValue() as number).toLocaleString()}` },
    { accessorKey: 'status', header: 'ステータス', cell: ({ getValue }) => <InvoiceStatusBadge status={getValue() as Invoice['status']} /> },
    { accessorKey: 'dueDate', header: '期限', cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
  ];

  return (
    <Box>
      <PageHeader title="ダッシュボード" subtitle="電子取引の状況サマリー" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="今月の送信件数" value={dashboardKpi.sendThisMonth} color="#1565C0" icon={<SendIcon />} trend={12} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="今月の受信件数" value={dashboardKpi.receiveThisMonth} color="#2e7d32" icon={<InboxIcon />} trend={-5} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="承認待ち" value={dashboardKpi.pendingApproval} color="#e65100" icon={<HourglassEmptyIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="今月完了件数" value={dashboardKpi.completedThisMonth} color="#6a1b9a" icon={<CheckCircleIcon />} trend={20} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <BarChartWidget
            title="月別送受信件数"
            data={monthlyData}
            bars={[{ key: 'send', name: '送信', color: '#1565C0' }, { key: 'receive', name: '受信', color: '#2e7d32' }]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PieChartWidget title="ステータス内訳" data={statusData} />
        </Grid>
      </Grid>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>⏳ 処理待ち一覧</Typography>
          <DataTable data={pending} columns={columns} globalFilter={false} pageSize={5} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
