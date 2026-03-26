import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Paper, Divider, InputAdornment,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email) { setError('メールアドレスを入力してください'); return; }
    const ok = login(email);
    if (ok) navigate('/dashboard');
    else setError('ログインに失敗しました');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ width: 420, p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="primary">📄 InvoiceFlow</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>電子取引管理システム</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Alert severity="info" sx={{ mb: 3, fontSize: 12 }}>
          <strong>デモ用アカウント</strong><br />
          admin@example.com（管理者）<br />
          hanako@example.com（マネージャー）<br />
          jiro@example.com（一般ユーザー）
        </Alert>

        <TextField fullWidth label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} />
        <TextField fullWidth label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />

        <Button fullWidth variant="contained" size="large" onClick={handleLogin} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}>
          ログイン
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          ※ デモ版：任意のパスワードでログインできます
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
