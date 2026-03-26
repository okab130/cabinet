import React from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: string[];
}

const PageHeader: React.FC<Props> = ({ title, subtitle, actions, breadcrumbs }) => (
  <Box sx={{ mb: 3 }}>
    {breadcrumbs && (
      <Breadcrumbs sx={{ mb: 1 }}>
        {breadcrumbs.map((b, i) => (
          <Typography key={i} variant="body2" color={i === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}>
            {b}
          </Typography>
        ))}
      </Breadcrumbs>
    )}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h5" fontWeight={600}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  </Box>
);

export default PageHeader;
