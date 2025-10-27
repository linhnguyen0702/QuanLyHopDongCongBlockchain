import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'user',
    department: '',
    phone: '',
    position: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser, error: userError } = useQuery(
    ['user', id],
    () => userAPI.getUser(id),
    {
      enabled: !!id,
    }
  );

  // Update form data when userData is loaded
  useEffect(() => {
    // userData is the full axios response, userData.data is response.data, userData.data.data is the actual data
    if (userData?.data?.data?.user) {
      const user = userData.data.data.user;
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        role: user.role || 'user',
        department: user.department || '',
        phone: user.phone || '',
        position: user.position || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [userData]);

  // Handle error when fetching user
  useEffect(() => {
    if (userError) {
      toast.error('Không thể tải thông tin người dùng');
      navigate('/users');
    }
  }, [userError, navigate]);

  const updateUserMutation = useMutation(
    (userData) => userAPI.updateUser(id, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', id]);
        toast.success('Cập nhật người dùng thành công!');
        navigate('/users');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Cập nhật người dùng thất bại!';
        toast.error(errorMessage);
        
        // Set field-specific errors if available
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      },
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      role: formData.role,
      department: formData.department.trim(),
      phone: formData.phone.trim(),
      position: formData.position.trim(),
      isActive: formData.isActive,
    };

    updateUserMutation.mutate(userData);
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang này.
        </Alert>
      </Box>
    );
  }

  if (isLoadingUser) {
    return <LoadingSpinner />;
  }

  // Show error if userError exists or if we have no user data after loading
  if (userError || (!userData?.data?.data?.user && !isLoadingUser)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {userError ? 'Không thể tải thông tin người dùng. Vui lòng thử lại.' : 'Không tìm thấy người dùng.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Chỉnh sửa người dùng
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Thông tin cơ bản
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  required
                />
              </Grid>

              {/* Role and Department */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', mt: 2 }}>
                  Vai trò và phòng ban
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Vai trò"
                  >
                    <MenuItem value="user">Người dùng</MenuItem>
                    <MenuItem value="manager">Quản lý</MenuItem>
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phòng ban"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chức vụ"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleInputChange}
                    label="Trạng thái"
                  >
                    <MenuItem value={true}>Hoạt động</MenuItem>
                    <MenuItem value={false}>Không hoạt động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={updateUserMutation.isLoading}
                  >
                    {updateUserMutation.isLoading ? 'Đang cập nhật...' : 'Cập nhật người dùng'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/users')}
                  >
                    Hủy
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditUser;
