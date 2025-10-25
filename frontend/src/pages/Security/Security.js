import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { securityAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SecurityItem = ({ title, description, enabled, onToggle, icon, color = 'primary' }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={onToggle}
              color={color}
            />
          }
          label=""
        />
      </Box>
    </CardContent>
  </Card>
);

const SecurityAlert = ({ type, message, icon }) => (
  <Alert 
    severity={type} 
    icon={icon}
    sx={{ mb: 2 }}
  >
    {message}
  </Alert>
);

const Security = () => {
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch security settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery(
    'securitySettings',
    securityAPI.getSettings,
    {
      enabled: isAdmin,
      select: (data) => data.data.settings
    }
  );

  // Fetch security alerts
  const { data: alertsData } = useQuery(
    'securityAlerts',
    securityAPI.getAlerts,
    {
      enabled: isAdmin,
      select: (data) => data.data.alerts
    }
  );

  // Fetch security activities
  const { data: activitiesData } = useQuery(
    'securityActivities',
    securityAPI.getActivities,
    {
      enabled: isAdmin,
      select: (data) => data.data.activities
    }
  );

  // Update settings mutation
  const updateSettingsMutation = useMutation(
    (settings) => securityAPI.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('securitySettings');
        toast.success('Đã lưu cài đặt bảo mật!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Lưu cài đặt thất bại!');
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (passwordData) => securityAPI.changePassword(passwordData),
    {
      onSuccess: () => {
        toast.success('Đã thay đổi mật khẩu thành công!');
        setChangePasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Thay đổi mật khẩu thất bại!');
      }
    }
  );

  const securitySettings = settingsData || {
    twoFactorAuth: false,
    passwordPolicy: true,
    sessionTimeout: true,
    ipWhitelist: false,
    auditLogging: true,
    encryption: true,
    backupEnabled: true,
    autoLogout: true
  };

  const securityAlerts = alertsData || [];
  const recentActivities = activitiesData || [];

  const handleToggle = (setting) => {
    const newSettings = {
      ...securitySettings,
      [setting]: !securitySettings[setting]
    };
    updateSettingsMutation.mutate(newSettings);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(securitySettings);
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

  if (settingsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Bảo mật hệ thống
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bạn không có quyền truy cập trang này
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chỉ quản trị viên mới có thể quản lý bảo mật hệ thống
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Bảo mật hệ thống
      </Typography>

      {/* Security Alerts */}
      <Box sx={{ mb: 3 }}>
        {securityAlerts.map((alert, index) => (
          <SecurityAlert
            key={index}
            type={alert.type}
            message={alert.message}
            icon={alert.icon}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Security Settings */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Cài đặt bảo mật
              </Typography>
              
              <SecurityItem
                title="Xác thực 2 yếu tố"
                description="Yêu cầu mã OTP khi đăng nhập"
                enabled={securitySettings.twoFactorAuth}
                onToggle={() => handleToggle('twoFactorAuth')}
                icon={<VpnKeyIcon />}
                color="primary"
              />
              
              <SecurityItem
                title="Chính sách mật khẩu"
                description="Yêu cầu mật khẩu mạnh và thay đổi định kỳ"
                enabled={securitySettings.passwordPolicy}
                onToggle={() => handleToggle('passwordPolicy')}
                icon={<LockIcon />}
                color="warning"
              />
              
              <SecurityItem
                title="Hết hạn phiên đăng nhập"
                description="Tự động đăng xuất sau 30 phút không hoạt động"
                enabled={securitySettings.sessionTimeout}
                onToggle={() => handleToggle('sessionTimeout')}
                icon={<ShieldIcon />}
                color="info"
              />
              
              <SecurityItem
                title="Danh sách IP được phép"
                description="Chỉ cho phép đăng nhập từ IP đã đăng ký"
                enabled={securitySettings.ipWhitelist}
                onToggle={() => handleToggle('ipWhitelist')}
                icon={<SecurityIcon />}
                color="secondary"
              />
              
              <SecurityItem
                title="Ghi log hoạt động"
                description="Ghi lại tất cả hoạt động của người dùng"
                enabled={securitySettings.auditLogging}
                onToggle={() => handleToggle('auditLogging')}
                icon={<InfoIcon />}
                color="success"
              />
              
              <SecurityItem
                title="Mã hóa dữ liệu"
                description="Mã hóa dữ liệu nhạy cảm trong database"
                enabled={securitySettings.encryption}
                onToggle={() => handleToggle('encryption')}
                icon={<LockIcon />}
                color="error"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                >
                  Lưu cài đặt
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                >
                  Làm mới
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Actions & Recent Activities */}
        <Grid item xs={12} md={4}>
          {/* Change Password */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Thay đổi mật khẩu
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordDialog(true)}
              >
                Đổi mật khẩu
              </Button>
            </CardContent>
          </Card>

          {/* Recent Security Activities */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Hoạt động gần đây
              </Typography>
              <List dense>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {activity.status === 'success' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time} • {activity.ip}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thay đổi mật khẩu</DialogTitle>
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
          <Button onClick={handleChangePassword} variant="contained">
            Thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Security;
