import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import {
  Description as ContractIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Approval as ApprovalIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {title}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
      {subtitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: trend === 'positive' ? 'success.main' : trend === 'negative' ? 'error.main' : 'text.secondary',
              fontWeight: 'medium'
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'active': return 'info';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'active': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Hủy bỏ';
      default: return status;
    }
  };

  return (
    <Chip
      label={getStatusText(status)}
      color={getStatusColor(status)}
      size="small"
      sx={{
        borderRadius: 2,
        minWidth: 'fit-content',
        whiteSpace: 'nowrap',
        fontSize: '0.75rem',
        fontWeight: 500,
        height: '24px',
        '& .MuiChip-label': {
          padding: '0 8px',
          lineHeight: 1.2
        }
      }}
    />
  );
};

const QuickActionButton = ({ icon, label, onClick, color = 'primary' }) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 'medium',
      borderColor: `${color}.main`,
      color: `${color}.main`,
      '&:hover': {
        backgroundColor: `${color}.main`,
        color: 'white',
      },
    }}
  >
    {label}
  </Button>
);

const AlertCard = ({ type, title, message, icon }) => (
  <Alert
    severity={type}
    icon={icon}
    sx={{
      borderRadius: 2,
      '& .MuiAlert-message': {
        width: '100%',
      },
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Alert>
);

const Dashboard = () => {
  const navigate = useNavigate();
  
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    reportAPI.getDashboardData,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    console.error('Dashboard error:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Lỗi tải dữ liệu dashboard
          </Typography>
          <Typography variant="body2">
            {error.response?.data?.message || error.message || 'Không thể tải dữ liệu dashboard'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()} 
            sx={{ mt: 2 }}
          >
            Tải lại trang
          </Button>
        </Alert>
      </Box>
    );
  }

  const { 
    totalContracts = 0, 
    totalValue = 0, 
    avgValue = 0, 
    recentContracts = [], 
    expiringContracts = 0,
    totalContractors = 0,
    performance = 0
  } = dashboardData?.data?.data || {};

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };


  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            Dashboard Tổng quan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi và quản lý các hợp đồng dự án nhà nước
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/contracts/create')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'medium' }}
        >
          Tạo hợp đồng mới
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng hợp đồng"
            value={totalContracts}
            icon={<ContractIcon />}
            color="primary"
            subtitle="Tổng số hợp đồng"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nhà thầu"
            value={totalContractors}
            icon={<BusinessIcon />}
            color="info"
            subtitle="Tổng số nhà thầu"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Giá trị hợp đồng"
            value={formatCurrency(totalValue)}
            icon={<AttachMoneyIcon />}
            color="success"
            subtitle={`Trung bình: ${formatCurrency(avgValue)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hiệu suất"
            value={`${performance}%`}
            icon={<CheckCircleIcon />}
            color="warning"
            subtitle="Tỷ lệ hoàn thành đúng hạn"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Contracts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              Hợp đồng gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Danh sách các hợp đồng được tạo và cập nhật gần đây
            </Typography>
            {recentContracts && recentContracts.length > 0 ? (
              recentContracts.map((contract, index) => (
                <Box key={contract._id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {contract.contractName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contract.contractor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(contract.contractValue)}
                      </Typography>
                    </Box>
                    <StatusChip status={contract.status} />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Số hợp đồng: {contract.contractNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo: {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Chưa có hợp đồng nào
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions & Alerts */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Thao tác nhanh
              </Typography>
              <Stack spacing={2}>
                <QuickActionButton
                  icon={<AddIcon />}
                  label="Tạo hợp đồng mới"
                  onClick={() => navigate('/contracts/create')}
                  color="primary"
                />
                <QuickActionButton
                  icon={<BusinessIcon />}
                  label="Thêm nhà thầu"
                  onClick={() => navigate('/contractors/create')}
                  color="info"
                />
                <QuickActionButton
                  icon={<ApprovalIcon />}
                  label="Phê duyệt hợp đồng"
                  onClick={() => navigate('/contracts?status=pending')}
                  color="success"
                />
              </Stack>
            </Paper>

            {/* Alerts */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Cảnh báo
              </Typography>
              <Stack spacing={2}>
                {expiringContracts > 0 && (
                  <AlertCard
                    type="warning"
                    title={`${expiringContracts} hợp đồng sắp hết hạn`}
                    message="Cần gia hạn trong 30 ngày tới"
                    icon={<AccessTimeIcon />}
                  />
                )}
                {totalContracts === 0 && (
                  <AlertCard
                    type="info"
                    title="Chưa có hợp đồng nào"
                    message="Hãy tạo hợp đồng đầu tiên để bắt đầu"
                    icon={<ContractIcon />}
                  />
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
