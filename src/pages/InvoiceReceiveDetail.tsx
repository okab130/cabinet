import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Divider,
  TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import StampIcon from '@mui/icons-material/Approval';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { InvoiceStatusBadge } from '../components/common/StatusBadge';
import InvoicePdfDocument from '../components/pdf/InvoicePdfDocument';
import { useInvoiceStore } from '../store/invoiceStore';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';

const docTypeLabel: Record<string, string> = {
  invoice: '請求書', delivery_note: '納品書', quotation: '見積書',
  purchase_order: '発注書', receipt: '領収書',
};

const InvoiceReceiveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, stampInvoice } = useInvoiceStore();
  const { currentUser } = useAuthStore();
  const [comment, setComment] = useState('');
  const [stampDialog, setStampDialog] = useState(false);
  const [stamped, setStamped] = useState(false);

  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) return <Box><Typography>帳票が見つかりません</Typography></Box>;

  const handleStamp = () => {
    stampInvoice(invoice.id, currentUser?.id ?? 'u001');
    setStamped(true);
    setStampDialog(false);
  };

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ display: 'flex', py: 1, borderBottom: '1px solid #f5f5f5' }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title={`${docTypeLabel[invoice.docType] ?? '帳票'} 詳細`}
        breadcrumbs={['ホーム', '帳票受信', '詳細']}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PDFDownloadLink document={<InvoicePdfDocument invoice={invoice} />} fileName={`${invoice.invoiceNumber}.pdf`}>
              {({ loading }) => (
                <Button variant="outlined" disabled={loading} size="small">{loading ? '生成中...' : 'PDF出力'}</Button>
              )}
            </PDFDownloadLink>
            <Button variant="outlined" onClick={() => navigate(-1)} size="small">戻る</Button>
          </Box>
        }
      />

      {(stamped || invoice.stampedAt) && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✓ 電子押印済み — {dayjs(invoice.stampedAt ?? new Date()).format('YYYY/MM/DD HH:mm')}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>帳票情報</Typography>
                <InvoiceStatusBadge status={invoice.status} />
              </Box>
              <InfoRow label="帳票番号" value={invoice.invoiceNumber} />
              <InfoRow label="帳票種類" value={docTypeLabel[invoice.docType]} />
              <InfoRow label="送付元" value={invoice.partnerName} />
              <InfoRow label="件名" value={invoice.description} />
              <InfoRow label="発行日" value={dayjs(invoice.issueDate).format('YYYY/MM/DD')} />
              <InfoRow label="支払期限" value={dayjs(invoice.dueDate).format('YYYY/MM/DD')} />
              <Divider sx={{ my: 1 }} />
              <InfoRow label="税抜金額" value={`¥${invoice.amount.toLocaleString()}`} />
              <InfoRow label="消費税" value={`¥${invoice.taxAmount.toLocaleString()}`} />
              <Box sx={{ display: 'flex', py: 1 }}>
                <Typography variant="body1" fontWeight={700} sx={{ width: 140 }}>合計金額</Typography>
                <Typography variant="body1" fontWeight={700} color="primary">¥{invoice.totalAmount.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>電子押印</Typography>
              {invoice.stampedAt ? (
                <Box>
                  <Chip icon={<StampIcon />} label="押印済み" color="success" sx={{ mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    押印日時: {dayjs(invoice.stampedAt).format('YYYY/MM/DD HH:mm')}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    帳票内容を確認の上、電子押印を行ってください。押印後は確認済みとして記録されます。
                  </Typography>
                  <Button fullWidth variant="contained" color="success" startIcon={<StampIcon />} onClick={() => setStampDialog(true)}>
                    電子押印する
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>コメント・メモ</Typography>
              <TextField fullWidth multiline rows={3} placeholder="確認内容やメモを入力..." value={comment} onChange={(e) => setComment(e.target.value)} size="small" />
              <Button fullWidth variant="outlined" sx={{ mt: 1 }} size="small">保存</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={stampDialog} onClose={() => setStampDialog(false)}>
        <DialogTitle>電子押印の確認</DialogTitle>
        <DialogContent>
          <Typography>以下の帳票に電子押印を行います。よろしいですか？</Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2"><strong>帳票番号:</strong> {invoice.invoiceNumber}</Typography>
            <Typography variant="body2"><strong>取引先:</strong> {invoice.partnerName}</Typography>
            <Typography variant="body2"><strong>金額:</strong> ¥{invoice.totalAmount.toLocaleString()}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStampDialog(false)}>キャンセル</Button>
          <Button onClick={handleStamp} variant="contained" color="success">押印する</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceReceiveDetail;
