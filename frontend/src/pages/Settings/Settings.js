import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Email as EmailIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { settingsAPI, userAPI, contractAPI, reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SettingSection = ({ title, icon, children }) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ 
          bgcolor: 'primary.light', 
          borderRadius: 2, 
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const Settings = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery(
    'systemSettings',
    settingsAPI.getSettings,
    {
      enabled: isAdmin,
      select: (data) => data.data.settings
    }
  );

  // Fetch system info
  const { data: systemInfoData } = useQuery(
    'systemInfo',
    settingsAPI.getSystemInfo,
    {
      enabled: isAdmin,
      select: (data) => data.data.systemInfo
    }
  );

  // Fetch system stats (users and contracts)
  const { data: systemStatsData } = useQuery(
    'systemStats',
    async () => {
      const [userStatsRes, dashboardDataRes] = await Promise.all([
        userAPI.getUserStats(),
        reportAPI.getDashboardData(),
      ]);
      return {
        totalUsers: dashboardDataRes.data.data.totalUsers || 0,
        totalContracts: dashboardDataRes.data.data.totalContracts || 0,
      };
    },
    {
      enabled: isAdmin,
    }
  );

  // Update settings mutation
  const updateSettingsMutation = useMutation(
    (settings) => settingsAPI.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('systemSettings');
        toast.success('Đã lưu cài đặt thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Lưu cài đặt thất bại!');
      }
    }
  );

  // Create backup mutation
  const createBackupMutation = useMutation(
    () => settingsAPI.createBackup(),
    {
      onSuccess: () => {
        toast.success('Tạo sao lưu thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo sao lưu thất bại!');
      }
    }
  );

  // Check updates mutation
  const checkUpdatesMutation = useMutation(
    () => settingsAPI.checkUpdates(),
    {
      onSuccess: (data) => {
        const updates = data.data.updates;
        if (updates.available) {
          toast.success(`Có bản cập nhật mới: ${updates.latestVersion}`);
        } else {
          toast.info('Hệ thống đã được cập nhật mới nhất');
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Kiểm tra cập nhật thất bại!');
      }
    }
  );

  // Clear cache mutation
  const clearCacheMutation = useMutation(
    () => settingsAPI.clearCache(),
    {
      onSuccess: () => {
        toast.success('Dọn dẹp cache thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Dọn dẹp cache thất bại!');
      }
    }
  );

  const settings = settingsData || {
    // General Settings
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    currency: 'VND',
    
    // Appearance Settings
    theme: 'light',
    primaryColor: '#7c3aed',
    fontSize: 'medium',
    compactMode: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    contractAlerts: true,
    systemAlerts: true,
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '1year',
    maintenanceMode: false,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@company.com',
    fromName: 'Contract Management System'
  };

  const systemInfo = {
    systemVersion: systemInfoData?.systemVersion || 'v1.0.0',
    databaseVersion: systemInfoData?.databaseVersion || 'MongoDB 6.0',
    nodeVersion: systemInfoData?.nodeVersion || 'v18.20.3',
    reactVersion: systemInfoData?.reactVersion || 'v18.2.0',
    totalUsers: systemStatsData?.totalUsers || 0,
    totalContracts: systemStatsData?.totalContracts || 0,
    lastUpdated: systemInfoData?.lastUpdated || new Date()
  };

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    updateSettingsMutation.mutate(newSettings);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleResetSettings = () => {
    // Reset to default settings
    const defaultSettings = {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      dateFormat: 'DD/MM/YYYY',
      currency: 'VND',
      theme: 'light',
      primaryColor: '#7c3aed',
      fontSize: 'medium',
      compactMode: false,
      emailNotifications: true,
      pushNotifications: false,
      contractAlerts: true,
      systemAlerts: true,
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: '1year',
      maintenanceMode: false,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@company.com',
      fromName: 'Contract Management System'
    };
    updateSettingsMutation.mutate(defaultSettings);
  };

  const systemInfoList = [
    { label: 'Phiên bản hệ thống', value: systemInfo.systemVersion },
    { label: 'Phiên bản database', value: systemInfo.databaseVersion },
    { label: 'Node.js version', value: systemInfo.nodeVersion },
    { label: 'React version', value: systemInfo.reactVersion },
    { label: 'Dung lượng sử dụng', value: '2.5 GB / 10 GB' },
    { label: 'Số lượng người dùng', value: systemInfo.totalUsers.toString() },
    { label: 'Số lượng hợp đồng', value: systemInfo.totalContracts.toString() },
    { label: 'Lần cập nhật cuối', value: new Date(systemInfo.lastUpdated).toLocaleDateString('vi-VN') }
  ];

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
          Cài đặt hệ thống
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bạn không có quyền truy cập trang này
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chỉ quản trị viên mới có thể quản lý cài đặt hệ thống
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Cài đặt hệ thống
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* General Settings */}
          <SettingSection title="Cài đặt chung" icon={<LanguageIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ngôn ngữ</InputLabel>
                  <Select
                    value={settings.language}
                    label="Ngôn ngữ"
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Múi giờ</InputLabel>
                  <Select
                    value={settings.timezone}
                    label="Múi giờ"
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Định dạng ngày</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    label="Định dạng ngày"
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tiền tệ</InputLabel>
                  <Select
                    value={settings.currency}
                    label="Tiền tệ"
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <MenuItem value="VND">VND</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingSection>

          {/* Appearance Settings */}
          <SettingSection title="Giao diện" icon={<PaletteIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Chủ đề</InputLabel>
                  <Select
                    value={settings.theme}
                    label="Chủ đề"
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">Sáng</MenuItem>
                    <MenuItem value="dark">Tối</MenuItem>
                    <MenuItem value="auto">Tự động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Màu chủ đạo"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Cỡ chữ</InputLabel>
                  <Select
                    value={settings.fontSize}
                    label="Cỡ chữ"
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  >
                    <MenuItem value="small">Nhỏ</MenuItem>
                    <MenuItem value="medium">Trung bình</MenuItem>
                    <MenuItem value="large">Lớn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                  }
                  label="Chế độ compact"
                />
              </Grid>
            </Grid>
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection title="Thông báo" icon={<NotificationsIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Thông báo email"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Thông báo push"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.contractAlerts}
                      onChange={(e) => handleSettingChange('contractAlerts', e.target.checked)}
                    />
                  }
                  label="Cảnh báo hợp đồng"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                    />
                  }
                  label="Cảnh báo hệ thống"
                />
              </Grid>
            </Grid>
          </SettingSection>

          {/* System Settings */}
          <SettingSection title="Hệ thống" icon={<StorageIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Sao lưu tự động"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tần suất sao lưu</InputLabel>
                  <Select
                    value={settings.backupFrequency}
                    label="Tần suất sao lưu"
                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  >
                    <MenuItem value="daily">Hàng ngày</MenuItem>
                    <MenuItem value="weekly">Hàng tuần</MenuItem>
                    <MenuItem value="monthly">Hàng tháng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Lưu trữ dữ liệu</InputLabel>
                  <Select
                    value={settings.dataRetention}
                    label="Lưu trữ dữ liệu"
                    onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                  >
                    <MenuItem value="6months">6 tháng</MenuItem>
                    <MenuItem value="1year">1 năm</MenuItem>
                    <MenuItem value="2years">2 năm</MenuItem>
                    <MenuItem value="forever">Vĩnh viễn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.g.target.checked)}
                    />
                  }
                  label="Chế độ bảo trì"
                />
              </Grid>
            </Grid>
          </SettingSection>

          {/* Email Settings */}
          <SettingSection title="Cài đặt Email" icon={<EmailIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.smtpHost}
                  onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP User"
                  value={settings.smtpUser}
                  onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email gửi"
                  value={settings.fromEmail}
                  onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên người gửi"
                  value={settings.fromName}
                  onChange={(e) => handleSettingChange('fromName', e.target.value)}
                />
              </Grid>
            </Grid>
          </SettingSection>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                  onClick={handleResetSettings}
                >
                  Khôi phục mặc định
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Thông tin hệ thống
              </Typography>
              <List dense>
                {systemInfoList.map((info, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={info.label}
                        secondary={info.value}
                      />
                    </ListItem>
                    {index < systemInfoList.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Thao tác nhanh
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<BackupIcon />}
                  fullWidth
                  onClick={() => createBackupMutation.mutate()}
                  disabled={createBackupMutation.isLoading}
                >
                  {createBackupMutation.isLoading ? 'Đang tạo...' : 'Tạo sao lưu ngay'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UpdateIcon />}
                  fullWidth
                  onClick={() => checkUpdatesMutation.mutate()}
                  disabled={checkUpdatesMutation.isLoading}
                >
                  {checkUpdatesMutation.isLoading ? 'Đang kiểm tra...' : 'Kiểm tra cập nhật'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StorageIcon />}
                  fullWidth
                  onClick={() => clearCacheMutation.mutate()}
                  disabled={clearCacheMutation.isLoading}
                >
                  {clearCacheMutation.isLoading ? 'Đang dọn dẹp...' : 'Dọn dẹp cache'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
