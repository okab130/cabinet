import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './store/authStore';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceSend from './pages/InvoiceSend';
import InvoiceSendNew from './pages/InvoiceSendNew';
import InvoiceReceive from './pages/InvoiceReceive';
import InvoiceReceiveDetail from './pages/InvoiceReceiveDetail';
import Approval from './pages/Approval';
import ApprovalList from './pages/ApprovalList';
import Partners from './pages/Partners';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import UserManagement from './pages/admin/UserManagement';

const SIDEBAR_WIDTH = 240;


const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
      <Sidebar open={sidebarOpen} />
      <Box component="main" sx={{ flexGrow: 1, ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0, mt: '64px', p: 3, minHeight: 'calc(100vh - 64px)', transition: 'margin 0.2s' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send" element={<InvoiceSend />} />
        <Route path="/send/new" element={<InvoiceSendNew />} />
        <Route path="/receive" element={<InvoiceReceive />} />
        <Route path="/receive/:id" element={<InvoiceReceiveDetail />} />
        <Route path="/approval" element={<Approval />} />
        <Route path="/approval/list" element={<ApprovalList />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
