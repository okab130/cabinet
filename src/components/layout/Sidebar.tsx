import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Box, Divider, Typography, Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BusinessIcon from '@mui/icons-material/Business';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: 'ダッシュボード', path: '/dashboard', icon: <DashboardIcon /> },
  {
    label: '帳票送信', path: '/send', icon: <SendIcon />,
    children: [
      { label: '送信一覧', path: '/send', icon: <ListAltIcon /> },
      { label: '新規送信', path: '/send/new', icon: <AddCircleOutlineIcon /> },
    ],
  },
  {
    label: '帳票受信', path: '/receive', icon: <InboxIcon />,
    children: [
      { label: '受信一覧', path: '/receive', icon: <ListAltIcon /> },
    ],
  },
  {
    label: '承認フロー', path: '/approval', icon: <AccountTreeIcon />,
    children: [
      { label: 'ワークフロー', path: '/approval', icon: <AccountTreeIcon /> },
      { label: '申請一覧', path: '/approval/list', icon: <ListAltIcon /> },
    ],
  },
  { label: '取引先管理', path: '/partners', icon: <BusinessIcon /> },
  { label: '文書管理', path: '/documents', icon: <FolderIcon /> },
  { label: '帳票出力', path: '/reports', icon: <AssessmentIcon /> },
  { label: 'ユーザー管理', path: '/admin/users', icon: <PeopleIcon />, adminOnly: true },
];

interface Props {
  open: boolean;
}

const Sidebar: React.FC<Props> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#f8f9fa', borderRight: '1px solid #e0e0e0' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', pt: 1 }}>
        {navItems.map((item) => {
          if (item.adminOnly && currentUser?.role !== 'admin') return null;
          if (item.children) {
            return (
              <Box key={item.path}>
                <ListItem disablePadding>
                  <ListItemButton sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#1565C0' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={<Typography variant="body2" fontWeight={600} color="#1565C0">{item.label}</Typography>} />
                  </ListItemButton>
                </ListItem>
                <Collapse in timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.path} disablePadding>
                        <ListItemButton
                          sx={{ pl: 5, py: 0.4, bgcolor: isActive(child.path) ? '#e3f2fd' : 'transparent', borderRight: isActive(child.path) ? '3px solid #1565C0' : 'none' }}
                          onClick={() => navigate(child.path)}
                        >
                          <ListItemIcon sx={{ minWidth: 30, color: isActive(child.path) ? '#1565C0' : 'text.secondary' }}>{child.icon}</ListItemIcon>
                          <ListItemText primary={<Typography variant="body2" color={isActive(child.path) ? '#1565C0' : 'text.primary'}>{child.label}</Typography>} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
                <Divider sx={{ my: 0.5 }} />
              </Box>
            );
          }
          return (
            <React.Fragment key={item.path}>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ bgcolor: isActive(item.path) ? '#e3f2fd' : 'transparent', borderRight: isActive(item.path) ? '3px solid #1565C0' : 'none' }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? '#1565C0' : 'text.secondary' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={<Typography variant="body2" color={isActive(item.path) ? '#1565C0' : 'text.primary'}>{item.label}</Typography>} />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 0.5 }} />
            </React.Fragment>
          );
        })}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
