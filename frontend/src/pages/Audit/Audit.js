import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  History as HistoryIcon,
  Person as PersonIcon,
  Description as ContractIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { auditAPI } from '../../services/api';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'contract': return <ContractIcon />;
      case 'user': return <PersonIcon />;
      case 'contractor': return <BusinessIcon />;
      case 'security': return <SecurityIcon />;
      default: return <HistoryIcon />;
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'created': return 'success';
      case 'updated': return 'info';
      case 'deleted': return 'error';
      case 'approved': return 'primary';
      case 'activated': return 'success';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'created': return 'Tạo mới';
      case 'updated': return 'Cập nhật';
      case 'deleted': return 'Xóa';
      case 'approved': return 'Phê duyệt';
      case 'activated': return 'Kích hoạt';
      case 'suspended': return 'Tạm dừng';
      case 'login': return 'Đăng nhập';
      case 'logout': return 'Đăng xuất';
      default: return action;
    }
  };

  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: `${getActivityColor(activity.action)}.light` }}>
          {getActivityIcon(activity.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {activity.description}
            </Typography>
            <Chip
              label={getActionText(activity.action)}
              color={getActivityColor(activity.action)}
              size="small"
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {activity.userName} • {activity.type === 'contract' ? 'Hợp đồng' : 
                activity.type === 'user' ? 'Người dùng' :
                activity.type === 'contractor' ? 'Nhà thầu' : 'Hệ thống'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(activity.timestamp).toLocaleString('vi-VN')}
            </Typography>
            {activity.details && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {activity.details}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

const Audit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { isManager } = useAuth();

  // Fetch audit logs from API
  const { data: auditData, isLoading } = useQuery(
    ['auditLogs', { search: searchTerm, type: typeFilter, action: actionFilter, date: dateFilter }],
    () => auditAPI.getAuditLogs({
      search: searchTerm,
      type: typeFilter,
      action: actionFilter,
      startDate: dateFilter ? new Date(dateFilter).toISOString() : undefined,
      endDate: dateFilter ? new Date(new Date(dateFilter).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
      page: 1,
      limit: 50
    }),
    {
      enabled: isManager,
      keepPreviousData: true
    }
  );

  const auditLogs = auditData?.data?.logs || [];

  if (isLoading) return <LoadingSpinner />;

  if (!isManager) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Audit Trail
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bạn không có quyền truy cập trang này
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chỉ quản lý và quản trị viên mới có thể xem audit trail
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Audit Trail
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={typeFilter}
                  label="Loại"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="contract">Hợp đồng</MenuItem>
                  <MenuItem value="user">Người dùng</MenuItem>
                  <MenuItem value="contractor">Nhà thầu</MenuItem>
                  <MenuItem value="security">Bảo mật</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Hành động</InputLabel>
                <Select
                  value={actionFilter}
                  label="Hành động"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="created">Tạo mới</MenuItem>
                  <MenuItem value="updated">Cập nhật</MenuItem>
                  <MenuItem value="deleted">Xóa</MenuItem>
                  <MenuItem value="approved">Phê duyệt</MenuItem>
                  <MenuItem value="activated">Kích hoạt</MenuItem>
                  <MenuItem value="suspended">Tạm dừng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Ngày"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
                  setActionFilter('');
                  setDateFilter('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Lịch sử hoạt động ({auditLogs.length})
        </Typography>
        
        {auditLogs.length > 0 ? (
          <List>
            {auditLogs.map((activity, index) => (
              <React.Fragment key={activity._id}>
                <ActivityItem activity={{
                  ...activity,
                  userName: activity.performedBy?.fullName || activity.performedBy?.username || 'Unknown',
                  timestamp: activity.performedAt
                }} />
                {index < auditLogs.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy hoạt động nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy thử thay đổi bộ lọc để xem kết quả khác
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Audit;
