import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { contractorAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateContractor = () => {
  const [formData, setFormData] = useState({
    contractorCode: '',
    contractorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxCode: '',
    businessLicense: '',
    contractorType: 'construction',
    status: 'active',
    rating: 3,
    description: ''
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const createContractorMutation = useMutation(
    (contractorData) => contractorAPI.createContractor(contractorData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('contractors');
        toast.success('Tạo nhà thầu thành công!');
        navigate('/contractors');
      },
      onError: (error) => {
        console.error('Create contractor error:', error);
        toast.error(error.response?.data?.message || 'Tạo nhà thầu thất bại!');
      }
    }
  );

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contractorCode.trim()) {
      newErrors.contractorCode = 'Mã nhà thầu là bắt buộc';
    }

    if (!formData.contractorName.trim()) {
      newErrors.contractorName = 'Tên nhà thầu là bắt buộc';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Người liên hệ là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.taxCode.trim()) {
      newErrors.taxCode = 'Mã số thuế là bắt buộc';
    } else if (!/^[0-9]{10,13}$/.test(formData.taxCode)) {
      newErrors.taxCode = 'Mã số thuế phải có 10-13 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createContractorMutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate('/contractors');
  };

  if (!isManager) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Tạo nhà thầu mới
        </Typography>
        <Alert severity="error">
          Bạn không có quyền tạo nhà thầu mới. Chỉ quản lý và quản trị viên mới có thể thực hiện chức năng này.
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
          Tạo nhà thầu mới
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Thông tin nhà thầu
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mã nhà thầu *"
                  value={formData.contractorCode}
                  onChange={handleInputChange('contractorCode')}
                  error={!!errors.contractorCode}
                  helperText={errors.contractorCode}
                  placeholder="VD: NT001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên nhà thầu *"
                  value={formData.contractorName}
                  onChange={handleInputChange('contractorName')}
                  error={!!errors.contractorName}
                  helperText={errors.contractorName}
                  placeholder="VD: Công ty TNHH ABC"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Người liên hệ *"
                  value={formData.contactPerson}
                  onChange={handleInputChange('contactPerson')}
                  error={!!errors.contactPerson}
                  helperText={errors.contactPerson}
                  placeholder="VD: Nguyễn Văn A"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="VD: contact@abc.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại *"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  placeholder="VD: 0123456789"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mã số thuế *"
                  value={formData.taxCode}
                  onChange={handleInputChange('taxCode')}
                  error={!!errors.taxCode}
                  helperText={errors.taxCode}
                  placeholder="VD: 0123456789"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ *"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  error={!!errors.address}
                  helperText={errors.address}
                  placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Giấy phép kinh doanh"
                  value={formData.businessLicense}
                  onChange={handleInputChange('businessLicense')}
                  placeholder="VD: 41A1234567"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại nhà thầu *</InputLabel>
                  <Select
                    value={formData.contractorType}
                    label="Loại nhà thầu *"
                    onChange={handleInputChange('contractorType')}
                  >
                    <MenuItem value="construction">Xây dựng</MenuItem>
                    <MenuItem value="supply">Cung cấp</MenuItem>
                    <MenuItem value="service">Dịch vụ</MenuItem>
                    <MenuItem value="consulting">Tư vấn</MenuItem>
                    <MenuItem value="other">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.status}
                    label="Trạng thái"
                    onChange={handleInputChange('status')}
                  >
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                    <MenuItem value="suspended">Tạm dừng</MenuItem>
                    <MenuItem value="blacklisted">Cấm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Đánh giá</InputLabel>
                  <Select
                    value={formData.rating}
                    label="Đánh giá"
                    onChange={handleInputChange('rating')}
                  >
                    <MenuItem value={1}>1 sao</MenuItem>
                    <MenuItem value={2}>2 sao</MenuItem>
                    <MenuItem value={3}>3 sao</MenuItem>
                    <MenuItem value={4}>4 sao</MenuItem>
                    <MenuItem value={5}>5 sao</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Mô tả về nhà thầu..."
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={createContractorMutation.isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={createContractorMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={createContractorMutation.isLoading}
              >
                {createContractorMutation.isLoading ? 'Đang tạo...' : 'Tạo nhà thầu'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateContractor;
