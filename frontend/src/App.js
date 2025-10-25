import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Contracts from './pages/Contracts/Contracts';
import ContractDetail from './pages/Contracts/ContractDetail';
import CreateContract from './pages/Contracts/CreateContract';
import EditContract from './pages/Contracts/EditContract';
import Users from './pages/Users/Users';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';
import Contractors from './pages/Contractors/Contractors';
import CreateContractor from './pages/Contractors/CreateContractor';
import EditContractor from './pages/Contractors/EditContractor';
import ContractorDetail from './pages/Contractors/ContractorDetail';
import Audit from './pages/Audit/Audit';
import Security from './pages/Security/Security';
import Settings from './pages/Settings/Settings';
import Approval from './pages/Approval/Approval';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Manager Route component
const ManagerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Contract routes */}
                    <Route path="/contracts" element={<Contracts />} />
                    <Route path="/contracts/create" element={<CreateContract />} />
                    <Route path="/contracts/:id" element={<ContractDetail />} />
                    <Route path="/contracts/:id/edit" element={<EditContract />} />
                    
                    {/* Approval routes */}
                    <Route 
                      path="/approval" 
                      element={
                        <ManagerRoute>
                          <Approval />
                        </ManagerRoute>
                      } 
                    />
                    
                    {/* User routes */}
                    <Route 
                      path="/users" 
                      element={
                        <AdminRoute>
                          <Users />
                        </AdminRoute>
                      } 
                    />
                    
                    {/* Report routes */}
                    <Route 
                      path="/reports" 
                      element={
                        <ManagerRoute>
                          <Reports />
                        </ManagerRoute>
                      } 
                    />
                    
                    {/* Contractor routes */}
                    <Route path="/contractors" element={<Contractors />} />
                    <Route path="/contractors/create" element={<CreateContractor />} />
                    <Route path="/contractors/:id" element={<ContractorDetail />} />
                    <Route path="/contractors/:id/edit" element={<EditContractor />} />
                    
                    {/* Audit routes */}
                    <Route path="/audit" element={<Audit />} />
                    
                    {/* Security routes */}
                    <Route path="/security" element={<Security />} />
                    
                    {/* Settings routes */}
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* Profile route */}
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
