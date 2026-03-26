import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export interface StepNodeData {
  label: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  actedAt?: string;
  [key: string]: unknown;
}

const statusConfig = {
  approved: { color: '#e8f5e9', border: '#4caf50', icon: <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} /> },
  rejected: { color: '#ffebee', border: '#f44336', icon: <CancelIcon sx={{ color: '#f44336', fontSize: 18 }} /> },
  pending: { color: '#fff8e1', border: '#ff9800', icon: <HourglassEmptyIcon sx={{ color: '#ff9800', fontSize: 18 }} /> },
};

const ApprovalStepNode: React.FC<NodeProps> = ({ data }) => {
  const d = data as StepNodeData;
  const cfg = statusConfig[d.status];
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Box sx={{ bgcolor: cfg.color, border: `2px solid ${cfg.border}`, borderRadius: 2, px: 2, py: 1.5, minWidth: 160, maxWidth: 200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          {cfg.icon}
          <Typography variant="caption" fontWeight={700}>{d.label}</Typography>
        </Box>
        <Typography variant="body2" fontWeight={600}>{d.approverName}</Typography>
        {d.status !== 'pending' && (
          <Chip label={d.status === 'approved' ? '承認済み' : '差戻し'} size="small"
            color={d.status === 'approved' ? 'success' : 'error'} sx={{ mt: 0.5, fontSize: 10 }} />
        )}
        {d.comment && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            "{d.comment}"
          </Typography>
        )}
      </Box>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(ApprovalStepNode);
