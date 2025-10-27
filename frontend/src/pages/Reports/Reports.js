import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          bgcolor: `${color}.light`, 
          borderRadius: 2, 
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const { isManager } = useAuth();

  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    'contracts-summary',
    () => reportAPI.getContractSummary({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    {
      enabled: isManager,
    }
  );

  const { data: expiringData, isLoading: expiringLoading } = useQuery(
    'contracts-expiring',
    () => reportAPI.getExpiringContracts({ days: 30 }),
    {
      enabled: isManager,
    }
  );

  if (!isManager) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Báo cáo và thống kê
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bạn không có quyền truy cập trang này
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chỉ quản lý và quản trị viên mới có thể xem báo cáo
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (summaryLoading || expiringLoading) {
    return <LoadingSpinner />;
  }

  const summary = summaryData?.data?.data?.summary || {};
  const statusBreakdown = summaryData?.data?.data?.statusBreakdown || [];
  const expiringContracts = expiringData?.data?.data?.allContracts || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Báo cáo và thống kê
      </Typography>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Từ ngày"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Đến ngày"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng hợp đồng"
            value={summary.totalContracts || 0}
            icon={<AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
            color="primary"
            subtitle="Tổng số hợp đồng"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng giá trị"
            value={formatCurrency(summary.totalValue || 0)}
            icon={<AttachMoneyIcon sx={{ fontSize: 32, color: 'success.main' }} />}
            color="success"
            subtitle="Tổng giá trị hợp đồng"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Giá trị trung bình"
            value={formatCurrency(summary.avgValue || 0)}
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: 'info.main' }} />}
            color="info"
            subtitle="Giá trị trung bình mỗi hợp đồng"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sắp hết hạn"
            value={expiringContracts.length}
            icon={<WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />}
            color="warning"
            subtitle="Hợp đồng sắp hết hạn (30 ngày)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Phân bố theo trạng thái
            </Typography>
            {statusBreakdown.length > 0 ? (
              <Box>
                {statusBreakdown.map((status, index) => {
                  const percentage = summary.totalContracts > 0 
                    ? Math.round((status.count / summary.totalContracts) * 100) 
                    : 0;
                  
                  return (
                    <Box key={status._id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {status._id === 'draft' ? 'Nháp' :
                           status._id === 'pending' ? 'Chờ duyệt' :
                           status._id === 'approved' ? 'Đã duyệt' :
                           status._id === 'active' ? 'Đang thực hiện' :
                           status._id === 'completed' ? 'Hoàn thành' :
                           status._id === 'cancelled' ? 'Hủy bỏ' : status._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {status.count} ({percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Chưa có dữ liệu
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Expiring Contracts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Hợp đồng sắp hết hạn
            </Typography>
            {expiringContracts.length > 0 ? (
              <Box>
                {expiringContracts.slice(0, 5).map((contract) => {
                  const daysUntilExpiry = Math.ceil((contract.endDate - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Box key={contract._id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {contract.contractName}
                        </Typography>
                        <Chip 
                          label={`${daysUntilExpiry} ngày`}
                          color={daysUntilExpiry <= 7 ? 'error' : daysUntilExpiry <= 15 ? 'warning' : 'info'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Số hợp đồng: {contract.contractNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hết hạn: {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  );
                })}
                {expiringContracts.length > 5 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    Và {expiringContracts.length - 5} hợp đồng khác...
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Không có hợp đồng nào sắp hết hạn
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
