import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Grid, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../components/table/DataTable';
import PageHeader from '../components/common/PageHeader';
import { useInvoiceStore } from '../store/invoiceStore';
import { Partner } from '../types/partner';

const emptyPartner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', nameKana: '', code: '', email: '', phone: '', address: '',
  zipCode: '', contactPerson: '', invoiceRegistrationNumber: '', isActive: true,
};

const Partners: React.FC = () => {
  const { partners, addPartner, updatePartner, deletePartner } = useInvoiceStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>>(emptyPartner);
  const [editId, setEditId] = useState<string | null>(null);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleOpen = (p?: Partner) => {
    if (p) { setForm({ name: p.name, nameKana: p.nameKana, code: p.code, email: p.email, phone: p.phone, address: p.address, zipCode: p.zipCode, contactPerson: p.contactPerson, invoiceRegistrationNumber: p.invoiceRegistrationNumber, isActive: p.isActive }); setEditId(p.id); }
    else { setForm(emptyPartner); setEditId(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    if (editId) { updatePartner({ id: editId, ...form, createdAt: now, updatedAt: now }); }
    else { addPartner({ id: `p${Date.now()}`, ...form, createdAt: now, updatedAt: now }); }
    setDialogOpen(false);
  };

  const columns: ColumnDef<Partner, unknown>[] = [
    { accessorKey: 'code', header: 'コード', enableSorting: true },
    { accessorKey: 'name', header: '会社名', enableSorting: true },
    { accessorKey: 'contactPerson', header: '担当者' },
    { accessorKey: 'email', header: 'メール' },
    { accessorKey: 'phone', header: '電話番号' },
    { accessorKey: 'invoiceRegistrationNumber', header: 'インボイス番号', cell: ({ getValue }) => <code style={{ fontSize: 11 }}>{getValue() as string}</code> },
    { accessorKey: 'isActive', header: '状態', cell: ({ getValue }) => <Chip label={getValue() ? '有効' : '無効'} color={getValue() ? 'success' : 'default'} size="small" /> },
    {
      id: 'actions', header: '操作',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(row.original)}>編集</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteId(row.original.id)}>削除</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="取引先管理" subtitle={`${partners.length} 社`} breadcrumbs={['ホーム', '取引先管理']}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>新規登録</Button>}
      />
      <DataTable data={partners} columns={columns} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? '取引先編集' : '取引先新規登録'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="会社名" value={form.name} onChange={(e) => set('name', e.target.value)} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="フリガナ" value={form.nameKana} onChange={(e) => set('nameKana', e.target.value)} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth label="取引先コード" value={form.code} onChange={(e) => set('code', e.target.value)} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth label="担当者名" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth label="電話番号" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Grid>
            <Grid size={{ xs: 8 }}><TextField fullWidth label="メールアドレス" value={form.email} onChange={(e) => set('email', e.target.value)} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth label="郵便番号" value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="住所" value={form.address} onChange={(e) => set('address', e.target.value)} /></Grid>
            <Grid size={{ xs: 8 }}>
              <TextField fullWidth label="インボイス登録番号" value={form.invoiceRegistrationNumber}
                onChange={(e) => set('invoiceRegistrationNumber', e.target.value)} placeholder="T1234567890123" helperText="T + 13桁の数字" />
            </Grid>
            <Grid size={{ xs: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="有効" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>削除確認</DialogTitle>
        <DialogContent>この取引先を削除してもよろしいですか？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>キャンセル</Button>
          <Button color="error" variant="contained" onClick={() => { deletePartner(deleteId!); setDeleteId(null); }}>削除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Partners;
