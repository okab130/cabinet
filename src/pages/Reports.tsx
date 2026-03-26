import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, MenuItem, TextField, Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PageHeader from '../components/common/PageHeader';
import InvoicePdfDocument from '../components/pdf/InvoicePdfDocument';
import { useInvoiceStore } from '../store/invoiceStore';

const Reports: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const [selectedId, setSelectedId] = useState(invoices[0]?.id ?? '');
  const [excelMsg, setExcelMsg] = useState('');

  const selectedInvoice = invoices.find((i) => i.id === selectedId);

  const handleExcelExport = () => {
    setExcelMsg('Excel帳票はサーバーサイド（Spring Boot + Apache POI）で生成します。バックエンドが未起動のためスキップします。');
    setTimeout(() => setExcelMsg(''), 4000);
  };

  return (
    <Box>
      <PageHeader title="帳票出力" subtitle="PDF・Excel帳票の生成とダウンロード" breadcrumbs={['ホーム', '帳票出力']} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>出力条件</Typography>
              <TextField
                select fullWidth label="帳票を選択" value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)} sx={{ mb: 2 }}
              >
                {invoices.map((inv) => (
                  <MenuItem key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.partnerName}</MenuItem>
                ))}
              </TextField>
              {selectedInvoice && (
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5, mb: 2 }}>
                  <Typography variant="caption" display="block"><strong>取引先:</strong> {selectedInvoice.partnerName}</Typography>
                  <Typography variant="caption" display="block"><strong>件名:</strong> {selectedInvoice.description}</Typography>
                  <Typography variant="caption" display="block"><strong>金額:</strong> ¥{selectedInvoice.totalAmount.toLocaleString()}</Typography>
                  <Typography variant="caption" display="block"><strong>発行日:</strong> {selectedInvoice.issueDate}</Typography>
                </Box>
              )}
              {excelMsg && <Alert severity="info" sx={{ mb: 2, fontSize: 11 }}>{excelMsg}</Alert>}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedInvoice && (
                  <PDFDownloadLink document={<InvoicePdfDocument invoice={selectedInvoice} />} fileName={`${selectedInvoice.invoiceNumber}.pdf`}>
                    {({ loading }) => (
                      <Button fullWidth variant="contained" startIcon={<DownloadIcon />} disabled={loading}>
                        {loading ? 'PDF生成中...' : 'PDF ダウンロード'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
                <Button fullWidth variant="outlined" startIcon={<TableChartIcon />} onClick={handleExcelExport} color="success">
                  Excel ダウンロード
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>プレビュー</Typography>
              {selectedInvoice ? (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 3, minHeight: 400, bgcolor: '#fafafa' }}>
                  <Typography variant="h6" align="center" fontWeight={700} gutterBottom>
                    {selectedInvoice.docType === 'invoice' ? '請 求 書' : selectedInvoice.docType === 'delivery_note' ? '納 品 書' : '帳 票'}
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}><Typography variant="body2"><strong>帳票番号:</strong> {selectedInvoice.invoiceNumber}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2"><strong>発行日:</strong> {selectedInvoice.issueDate}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2"><strong>取引先:</strong> {selectedInvoice.partnerName}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2"><strong>支払期限:</strong> {selectedInvoice.dueDate}</Typography></Grid>
                  </Grid>
                  <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', p: 1, fontWeight: 700 }}>
                      <Typography variant="caption" sx={{ flex: 3 }}>摘要</Typography>
                      <Typography variant="caption" sx={{ flex: 1 }}>金額</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', p: 1 }}>
                      <Typography variant="body2" sx={{ flex: 3 }}>{selectedInvoice.description}</Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>¥{selectedInvoice.amount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', p: 1, bgcolor: '#fafafa' }}>
                      <Typography variant="body2" sx={{ flex: 3 }}>消費税(10%)</Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>¥{selectedInvoice.taxAmount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', p: 1, bgcolor: '#e3f2fd' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ flex: 3 }}>合計</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>¥{selectedInvoice.totalAmount.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  {selectedInvoice.stampedAt && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                      <Typography variant="caption" color="success.main">✓ 電子押印済み: {new Date(selectedInvoice.stampedAt).toLocaleString('ja-JP')}</Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">帳票を選択してください</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
