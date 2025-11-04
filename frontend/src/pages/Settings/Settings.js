import React, { useState, useEffect } from 'react';
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
  Cancel as CancelIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { settingsAPI, userAPI, reportAPI } from '../../services/api';
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

const Settings = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localSettings, setLocalSettings] = useState(null);

  const { data: settingsData, isLoading: settingsLoading } = useQuery(
    'systemSettings',
    settingsAPI.getSettings,
    {
      enabled: isAdmin,
      select: (data) => data.data.settings,
    }
  );

  useEffect(() => {
    if (!settingsLoading) {
      setLocalSettings(settingsData || defaultSettings);
    }
  }, [settingsLoading, settingsData]);

  const { data: systemInfoData } = useQuery(
    'systemInfo',
    settingsAPI.getSystemInfo,
    {
      enabled: isAdmin,
      select: (data) => data.data.systemInfo
    }
  );

  const { data: systemStatsData } = useQuery(
    'systemStats',
    async () => {
      const [, dashboardDataRes] = await Promise.all([
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

  const updateSettingsMutation = useMutation(
    (settings) => settingsAPI.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('systemSettings');
        toast.success('Đã lưu cài đặt thành công!');
        setIsEditMode(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Lưu cài đặt thất bại!');
      }
    }
  );

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleCancelEdit = () => {
    setLocalSettings(settingsData || defaultSettings);
    setIsEditMode(false);
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

  if (!localSettings) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Cài đặt hệ thống
        </Typography>
        {
          isEditMode ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isLoading}
              >
                {updateSettingsMutation.isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={() => setIsEditMode(true)}
            >
              Cài đặt
            </Button>
          )
        }
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SettingSection title="Cài đặt chung" icon={<LanguageIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditMode}>
                  <InputLabel>Ngôn ngữ</InputLabel>
                  <Select
                    value={localSettings.language}
                    label="Ngôn ngữ"
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditMode}>
                  <InputLabel>Múi giờ</InputLabel>
                  <Select
                    value={localSettings.timezone}
                    label="Múi giờ"
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditMode}>
                  <InputLabel>Định dạng ngày</InputLabel>
                  <Select
                    value={localSettings.dateFormat}
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
                <FormControl fullWidth disabled={!isEditMode}>
                  <InputLabel>Tiền tệ</InputLabel>
                  <Select
                    value={localSettings.currency}
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

          <SettingSection title="Giao diện" icon={<PaletteIcon />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditMode}>
                  <InputLabel>Chủ đề</InputLabel>
                  <Select
                    value={localSettings.theme}
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
                  value={localSettings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                  disabled={!isEditMode}
                  sx={{ 
                    '& .MuiInputBase-input.Mui-disabled': {
                      cursor: 'not-allowed',
                      backgroundColor: 'action.disabledBackground'
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditMode}>
                  <InputLabel>Cỡ chữ</InputLabel>
                  <Select
                    value={localSettings.fontSize}
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
                      checked={localSettings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                      disabled={!isEditMode}
                    />
                  }
                  label="Chế độ compact"
                />
              </Grid>
            </Grid>
          </SettingSection>

        </Grid>

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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
