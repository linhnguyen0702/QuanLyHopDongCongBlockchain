import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  Work as WorkIcon,
  Star as StarIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { contractorAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ContractorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();

  // Fetch contractor data
  const { data: contractorResponse, isLoading, error } = useQuery(
    ['contractor', id],
    () => contractorAPI.getContractor(id),
    {
      enabled: !!id,
      select: (data) => data.data?.data?.contractor
    }
  );

  const contractor = contractorResponse;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'warning';
      case 'blacklisted': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'suspended': return 'Tạm dừng';
      case 'blacklisted': return 'Cấm';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'inactive': return <ErrorIcon />;
      case 'suspended': return <WarningIcon />;
      case 'blacklisted': return <BlockIcon />;
      default: return <ErrorIcon />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'construction': return 'Xây dựng';
      case 'supply': return 'Cung cấp';
      case 'service': return 'Dịch vụ';
      case 'consulting': return 'Tư vấn';
      case 'other': return 'Khác';
      default: return type;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        sx={{
          color: index < rating ? '#ffc107' : '#e0e0e0',
          fontSize: 20
        }}
      />
    ));
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Chi tiết nhà thầu
        </Typography>
        <Alert severity="error">
          Không thể tải thông tin nhà thầu. Vui lòng thử lại sau.
        </Alert>
      </Box>
    );
  }

  if (!contractor) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Chi tiết nhà thầu
        </Typography>
        <Alert severity="error">
          Không tìm thấy nhà thầu.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contractors')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Chi tiết nhà thầu
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, fontSize: '2rem' }}>
                  <BusinessIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {contractor.contractorName}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Mã: {contractor.contractorCode}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(contractor.status)}
                      label={getStatusText(contractor.status)}
                      color={getStatusColor(contractor.status)}
                      size="small"
                    />
                    <Chip
                      label={getTypeText(contractor.contractorType)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {renderStars(contractor.rating)}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({contractor.rating}/5)
                    </Typography>
                  </Box>
                </Box>
                {isManager && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/contractors/${contractor._id}/edit`)}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </Box>

              {contractor.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Mô tả
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {contractor.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Người liên hệ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {contractor.contactPerson}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {contractor.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhoneIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {contractor.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <ReceiptIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mã số thuế
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {contractor.taxCode}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <LocationIcon color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {contractor.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {contractor.businessLicense && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <WorkIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Giấy phép kinh doanh
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {contractor.businessLicense}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Status Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Trạng thái
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {getStatusIcon(contractor.status)}
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {getStatusText(contractor.status)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {contractor.status === 'active' && 'Nhà thầu đang hoạt động bình thường'}
                {contractor.status === 'inactive' && 'Nhà thầu tạm thời không hoạt động'}
                {contractor.status === 'suspended' && 'Nhà thầu bị tạm dừng hoạt động'}
                {contractor.status === 'blacklisted' && 'Nhà thầu bị cấm hoạt động'}
              </Typography>
            </CardContent>
          </Card>

          {/* Rating Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đánh giá
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {renderStars(contractor.rating)}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {contractor.rating}/5 sao
              </Typography>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thông tin khác
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Loại nhà thầu"
                    secondary={getTypeText(contractor.contractorType)}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <HistoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ngày tạo"
                    secondary={new Date(contractor.createdAt).toLocaleDateString('vi-VN')}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <HistoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cập nhật lần cuối"
                    secondary={new Date(contractor.updatedAt).toLocaleDateString('vi-VN')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractorDetail;
