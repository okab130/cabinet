import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Alert, Divider, Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '../components/common/PageHeader';
import ApprovalFlowViewer from '../components/approval/ApprovalFlowViewer';
import { ApprovalStatusBadge } from '../components/common/StatusBadge';
import { useInvoiceStore } from '../store/invoiceStore';
import { useAuthStore } from '../store/authStore';
import { ApprovalRequest } from '../types/approval';
import dayjs from 'dayjs';

const Approval: React.FC = () => {
  const { approvals, approveStep, rejectStep } = useInvoiceStore();
  const { currentUser } = useAuthStore();
  const [selected, setSelected] = useState<ApprovalRequest | null>(approvals[0] ?? null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const canAct = selected
    ? selected.status === 'pending' && selected.steps[selected.currentStepIndex]?.approverId === currentUser?.id
    : false;

  const handleApprove = () => {
    if (!selected) return;
    approveStep(selected.id, comment);
    setMessage('承認しました');
    setComment('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReject = () => {
    if (!selected) return;
    rejectStep(selected.id, comment);
    setMessage('差し戻しました');
    setComment('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <Box>
      <PageHeader title="承認フロー" subtitle="ワークフロー可視化・承認/差戻し操作" breadcrumbs={['ホーム', '承認フロー']} />
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>承認申請一覧</Typography>
              {pendingApprovals.length === 0 && (
                <Typography variant="body2" color="text.secondary">処理待ちの申請はありません</Typography>
              )}
              {approvals.map((apr) => (
                <Box
                  key={apr.id}
                  onClick={() => setSelected(apr)}
                  sx={{
                    p: 1.5, mb: 1, borderRadius: 1, cursor: 'pointer', border: '1px solid',
                    borderColor: selected?.id === apr.id ? 'primary.main' : '#e0e0e0',
                    bgcolor: selected?.id === apr.id ? '#e3f2fd' : 'transparent',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: 12, lineHeight: 1.4 }}>{apr.title}</Typography>
                    <ApprovalStatusBadge status={apr.status} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">申請者: {apr.requesterName}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {dayjs(apr.createdAt).format('YYYY/MM/DD')}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {selected ? (
            <Box>
              <Card elevation={2} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{selected.title}</Typography>
                    <ApprovalStatusBadge status={selected.status} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selected.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={`申請者: ${selected.requesterName}`} size="small" variant="outlined" />
                    <Chip label={`現在ステップ: ${selected.currentStepIndex + 1}/${selected.steps.length}`} size="small" variant="outlined" color="primary" />
                    <Chip label={dayjs(selected.createdAt).format('YYYY/MM/DD HH:mm')} size="small" variant="outlined" />
                  </Box>
                  <ApprovalFlowViewer approval={selected} />
                </CardContent>
              </Card>

              {canAct && (
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>承認アクション</Typography>
                    <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
                      あなたは現在のステップ（ステップ {selected.currentStepIndex + 1}）の承認者です
                    </Alert>
                    <TextField fullWidth multiline rows={2} label="コメント（任意）" value={comment} onChange={(e) => setComment(e.target.value)} size="small" sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={handleApprove}>承認する</Button>
                      <Button variant="contained" color="error" startIcon={<CloseIcon />} onClick={handleReject}>差し戻す</Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {!canAct && selected.status === 'pending' && (
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      現在のステップの承認者は「{selected.steps[selected.currentStepIndex]?.approverName}」です。あなたは操作権限がありません。
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>承認履歴</Typography>
              {selected.steps.map((step) => (
                <Box key={step.stepIndex} sx={{ p: 1.5, mb: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>ステップ {step.stepIndex + 1}: {step.approverName}</Typography>
                    <Chip label={step.status === 'approved' ? '承認済み' : step.status === 'rejected' ? '差戻し' : '処理待ち'}
                      size="small" color={step.status === 'approved' ? 'success' : step.status === 'rejected' ? 'error' : 'default'} />
                  </Box>
                  {step.comment && <Typography variant="caption" color="text.secondary">「{step.comment}」</Typography>}
                  {step.actedAt && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{dayjs(step.actedAt).format('YYYY/MM/DD HH:mm')}</Typography>}
                </Box>
              ))}
            </Box>
          ) : (
            <Card elevation={2}><CardContent><Typography color="text.secondary">左の一覧から申請を選択してください</Typography></CardContent></Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Approval;
