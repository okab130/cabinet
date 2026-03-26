import React, { useState } from 'react';
import {
  Box, Button, TextField, MenuItem, Grid, Card, CardContent, Typography,
  Alert, Divider, IconButton, List, ListItem, ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { useInvoiceStore } from '../store/invoiceStore';
import { useAuthStore } from '../store/authStore';
import { Invoice } from '../types/invoice';
import { mockUsers } from '../data/mockData';

const docTypes = [
  { value: 'invoice', label: '請求書' }, { value: 'delivery_note', label: '納品書' },
  { value: 'quotation', label: '見積書' }, { value: 'purchase_order', label: '発注書' },
];

const InvoiceSendNew: React.FC = () => {
  const navigate = useNavigate();
  const { partners, addInvoice } = useInvoiceStore();
  const { currentUser } = useAuthStore();
  const [form, setForm] = useState({ docType: 'invoice', partnerId: '', invoiceNumber: '', description: '', amount: '', issueDate: '', dueDate: '' });
  const [approvers, setApprovers] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const addApprover = () => setApprovers((a) => [...a, '']);
  const setApprover = (i: number, v: string) => setApprovers((a) => a.map((x, j) => j === i ? v : x));
  const removeApprover = (i: number) => setApprovers((a) => a.filter((_, j) => j !== i));

  const handleSubmit = () => {
    const partner = partners.find((p) => p.id === form.partnerId);
    const amt = parseInt(form.amount, 10) || 0;
    const tax = Math.floor(amt * 0.1);
    const newInvoice: Invoice = {
      id: `inv${Date.now()}`, type: 'send', docType: form.docType as Invoice['docType'],
      invoiceNumber: form.invoiceNumber || `INV-${Date.now()}`,
      partnerId: form.partnerId, partnerName: partner?.name ?? '',
      amount: amt, taxAmount: tax, totalAmount: amt + tax,
      issueDate: form.issueDate, dueDate: form.dueDate, status: approvers.length > 0 ? 'pending_approval' : 'sent',
      description: form.description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id ?? 'u001',
    };
    addInvoice(newInvoice);
    setSuccess(true);
    setTimeout(() => navigate('/send'), 1500);
  };

  return (
    <Box>
      <PageHeader title="新規帳票送信" breadcrumbs={['ホーム', '帳票送信', '新規送信']} />
      {success && <Alert severity="success" sx={{ mb: 2 }}>送信が完了しました。一覧画面に戻ります...</Alert>}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>基本情報</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select fullWidth label="帳票種類" value={form.docType} onChange={(e) => set('docType', e.target.value)}>
                    {docTypes.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select fullWidth label="取引先" value={form.partnerId} onChange={(e) => set('partnerId', e.target.value)}>
                    {partners.filter((p) => p.isActive).map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="帳票番号" value={form.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} placeholder="INV-2024-XXX" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="件名・摘要" value={form.description} onChange={(e) => set('description', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="金額（税抜）" type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>¥</Typography> }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="発行日" type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="支払期限" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>ファイル添付</Typography>
              <Box sx={{ border: '2px dashed #90caf9', borderRadius: 2, p: 4, textAlign: 'center', bgcolor: '#f8fbff', cursor: 'pointer' }}>
                <UploadFileIcon sx={{ fontSize: 40, color: '#90caf9', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">PDFファイルをドラッグ＆ドロップ</Typography>
                <Typography variant="caption" color="text.secondary">または クリックしてファイルを選択（最大50MB）</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>社内承認フロー設定</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                承認者を設定しない場合は即時送信されます
              </Typography>
              <List dense>
                {approvers.map((a, i) => (
                  <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                    <ListItemText primary={
                      <TextField select fullWidth size="small" label={`承認者 ${i + 1}`} value={a} onChange={(e) => setApprover(i, e.target.value)}>
                        {mockUsers.filter((u) => u.role === 'manager' || u.role === 'admin').map((u) => (
                          <MenuItem key={u.id} value={u.id}>{u.displayName}</MenuItem>
                        ))}
                      </TextField>
                    } />
                    <IconButton size="small" onClick={() => removeApprover(i)}><DeleteIcon fontSize="small" /></IconButton>
                  </ListItem>
                ))}
              </List>
              <Button size="small" startIcon={<AddIcon />} onClick={addApprover}>承認者を追加</Button>

              <Divider sx={{ my: 2 }} />
              {form.amount && (
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">税抜金額</Typography>
                    <Typography variant="caption">¥{parseInt(form.amount || '0').toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">消費税(10%)</Typography>
                    <Typography variant="caption">¥{Math.floor(parseInt(form.amount || '0') * 0.1).toLocaleString()}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>合計</Typography>
                    <Typography variant="body2" fontWeight={600}>¥{Math.floor(parseInt(form.amount || '0') * 1.1).toLocaleString()}</Typography>
                  </Box>
                </Box>
              )}
              <Button fullWidth variant="contained" onClick={handleSubmit} disabled={!form.partnerId || !form.amount}>
                {approvers.length > 0 ? '承認申請して送信' : '送信する'}
              </Button>
              <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={() => navigate('/send')}>キャンセル</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceSendNew;
