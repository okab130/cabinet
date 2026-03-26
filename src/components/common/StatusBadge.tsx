import React from 'react';
import { Chip } from '@mui/material';
import { InvoiceStatus } from '../../types/invoice';
import { ApprovalStatus } from '../../types/approval';

const invoiceStatusMap: Record<InvoiceStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  draft: { label: 'ドラフト', color: 'default' },
  pending_approval: { label: '承認待ち', color: 'warning' },
  approved: { label: '承認済み', color: 'info' },
  sent: { label: '送信済み', color: 'primary' },
  received: { label: '受信済み', color: 'info' },
  confirmed: { label: '確認済み', color: 'success' },
  rejected: { label: '差戻し', color: 'error' },
};

const approvalStatusMap: Record<ApprovalStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  pending: { label: '処理待ち', color: 'warning' },
  approved: { label: '承認済み', color: 'success' },
  rejected: { label: '差戻し', color: 'error' },
  withdrawn: { label: '取消', color: 'default' },
};

export const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const s = invoiceStatusMap[status];
  return <Chip label={s.label} color={s.color} size="small" />;
};

export const ApprovalStatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const s = approvalStatusMap[status];
  return <Chip label={s.label} color={s.color} size="small" />;
};
