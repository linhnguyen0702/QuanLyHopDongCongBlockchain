import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfileTab = ({ user, onEdit, isEditing, onSave, onCancel, onAvatarChange }) => {
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload').click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      onAvatarChange(file);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatar ? `/uploads/avatars/${user.avatar.split('/').pop()}` : undefined}
              sx={{ width: 120, height: 120, fontSize: '3rem' }}
            >
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
              onClick={handleAvatarClick}
            >
              <CameraIcon />
            </IconButton>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {user?.fullName || 'Chưa cập nhật'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              @{user?.username}
            </Typography>
            <Chip
              label={user?.role === 'admin' ? 'Quản trị viên' : 
                     user?.role === 'manager' ? 'Quản lý' : 'Người dùng'}
              color={user?.role === 'admin' ? 'error' : 
                     user?.role === 'manager' ? 'warning' : 'primary'}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={onSave}
                    color="success"
                  >
                    Lưu
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={onCancel}
                  >
                    Hủy
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              value={user?.fullName || ''}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              value={user?.username || ''}
              disabled
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={user?.phone || ''}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phòng ban"
              value={user?.department || ''}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Chức vụ"
              value={user?.position || ''}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ActivityTab = ({ activities, isLoading }) => {
  const getActivityIcon = (action) => {
    switch (action) {
      case 'created': return <CheckCircleIcon color="success" />;
      case 'updated': return <EditIcon color="info" />;
      case 'deleted': return <ErrorIcon color="error" />;
      case 'login': return <SecurityIcon color="primary" />;
      default: return <InfoIcon color="default" />;
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'created': return 'Tạo mới';
      case 'updated': return 'Cập nhật';
      case 'deleted': return 'Xóa';
      case 'login': return 'Đăng nhập';
      case 'logout': return 'Đăng xuất';
      default: return action;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Lịch sử hoạt động
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : activities?.length > 0 ? (
          <List>
            {activities.map((activity, index) => (
              <React.Fragment key={activity._id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getActivityIcon(activity.action)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {getActionText(activity.action)} • {new Date(activity.performedAt).toLocaleString('vi-VN')}
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
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Chưa có hoạt động nào
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profileResponse, isLoading: profileLoading } = useQuery(
    'profile',
    profileAPI.getProfile,
    {
      select: (data) => data.data.user
    }
  );

  // Fetch activity log
  const { data: activityResponse, isLoading: activityLoading } = useQuery(
    'profileActivity',
    () => profileAPI.getActivityLog({ page: 1, limit: 20 }),
    {
      select: (data) => data.data.activities
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => profileAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('profile');
        queryClient.invalidateQueries('user');
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
      }
    }
  );

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation(
    (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return profileAPI.uploadAvatar(formData);
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('profile');
        queryClient.invalidateQueries('user');
        toast.success('Cập nhật ảnh đại diện thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật ảnh thất bại!');
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => profileAPI.changePassword(data),
    {
      onSuccess: () => {
        toast.success('Đổi mật khẩu thành công!');
        setChangePasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
      }
    }
  );

  const currentUser = profileResponse || user;

  const handleEdit = () => {
    setProfileData({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      department: currentUser?.department || '',
      position: currentUser?.position || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({});
  };

  const handleAvatarChange = (file) => {
    uploadAvatarMutation.mutate(file);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  if (profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Thông tin cá nhân
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Thông tin cá nhân" icon={<PersonIcon />} />
        <Tab label="Lịch sử hoạt động" icon={<HistoryIcon />} />
        <Tab label="Bảo mật" icon={<SecurityIcon />} />
      </Tabs>

      {tabValue === 0 && (
        <ProfileTab
          user={isEditing ? { ...currentUser, ...profileData } : currentUser}
          onEdit={handleEdit}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          onAvatarChange={handleAvatarChange}
        />
      )}

      {tabValue === 1 && (
        <ActivityTab
          activities={activityResponse}
          isLoading={activityLoading}
        />
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Bảo mật tài khoản
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cập nhật mật khẩu để bảo vệ tài khoản của bạn
              </Typography>
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                onClick={() => setChangePasswordDialog(true)}
              >
                Đổi mật khẩu
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Phiên đăng nhập
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quản lý các phiên đăng nhập của bạn
              </Typography>
              <Alert severity="info">
                Bạn đang đăng nhập từ thiết bị này. Để bảo mật, hãy đăng xuất khỏi các thiết bị khác nếu cần.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Mật khẩu hiện tại"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Mật khẩu mới"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Xác nhận mật khẩu mới"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>Hủy</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changePasswordMutation.isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            {changePasswordMutation.isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
