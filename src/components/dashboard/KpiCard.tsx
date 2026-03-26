import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface Props {
  title: string;
  value: number | string;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: number;
}

const KpiCard: React.FC<Props> = ({ title, value, unit = '件', color = '#1565C0', icon, trend }) => (
  <Card elevation={2} sx={{ borderTop: `4px solid ${color}`, height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{unit}</Typography>
          </Box>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {trend >= 0 ? <TrendingUpIcon fontSize="small" color="success" /> : <TrendingDownIcon fontSize="small" color="error" />}
              <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}% 前月比
              </Typography>
            </Box>
          )}
        </Box>
        {icon && (
          <Box sx={{ bgcolor: `${color}20`, borderRadius: 2, p: 1.5, color }}>
            {icon}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default KpiCard;
