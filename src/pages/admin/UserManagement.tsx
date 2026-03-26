import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../components/table/DataTable';
import PageHeader from '../../components/common/PageHeader';
import { mockUsers } from '../../data/mockData';
import { User, UserRole } from '../../types/user';
import dayjs from 'dayjs';

const roleColors: Record<UserRole, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  admin: 'error', manager: 'warning', user: 'primary', viewer: 'default',
};
const roleLabel: Record<UserRole, string> = { admin: '管理者', manager: 'マネージャー', user: '一般', viewer: '閲覧者' };

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ displayName: '', email: '', department: '', role: 'user' as UserRole });

  const handleOpen = (u?: User) => {
    if (u) { setForm({ displayName: u.displayName, email: u.email, department: u.department, role: u.role }); setEditUser(u); }
    else { setForm({ displayName: '', email: '', department: '', role: 'user' }); setEditUser(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    if (editUser) {
      setUsers((us) => us.map((u) => u.id === editUser.id ? { ...u, ...form, updatedAt: now } : u));
    } else {
      setUsers((us) => [...us, { id: `u${Date.now()}`, ...form, createdAt: now, updatedAt: now }]);
    }
    setDialogOpen(false);
  };

  const columns: ColumnDef<User, unknown>[] = [
    { accessorKey: 'displayName', header: '表示名', enableSorting: true },
    { accessorKey: 'email', header: 'メールアドレス', enableSorting: true },
    { accessorKey: 'department', header: '部署' },
    { accessorKey: 'role', header: 'ロール', cell: ({ getValue }) => <Chip label={roleLabel[getValue() as UserRole]} color={roleColors[getValue() as UserRole]} size="small" /> },
    { accessorKey: 'createdAt', header: '登録日', cell: ({ getValue }) => dayjs(getValue() as string).format('YYYY/MM/DD') },
    { id: 'actions', header: '操作', cell: ({ row }) => <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(row.original)}>編集</Button> },
  ];

  return (
    <Box>
      <PageHeader
        title="ユーザー管理" subtitle={`${users.length} ユーザー`} breadcrumbs={['ホーム', 'ユーザー管理']}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>ユーザー追加</Button>}
      />
      <DataTable data={users} columns={columns} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? 'ユーザー編集' : '新規ユーザー追加'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField fullWidth label="表示名" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
          <TextField fullWidth label="メールアドレス" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <TextField fullWidth label="部署" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
          <TextField select fullWidth label="ロール" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
            <MenuItem value="admin">管理者</MenuItem>
            <MenuItem value="manager">マネージャー</MenuItem>
            <MenuItem value="user">一般ユーザー</MenuItem>
            <MenuItem value="viewer">閲覧者</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.displayName || !form.email}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
