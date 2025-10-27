import axios from 'axios';

// Create axios instance
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('🔗 API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm cache-busting headers cho API users
    if (config.url && config.url.includes('/users')) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout'),
};

// Contract API
export const contractAPI = {
  getContracts: (params) => api.get('/contracts', { params }),
  getContract: (id) => api.get(`/contracts/${id}`),
  createContract: (contractData) => api.post('/contracts', contractData),
  updateContract: (id, contractData) => api.put(`/contracts/${id}`, contractData),
  deleteContract: (id) => api.delete(`/contracts/${id}`),
  approveContract: (id, comment) => api.post(`/contracts/${id}/approve`, { comment }),
  rejectContract: (id, comment) => api.post(`/contracts/${id}/reject`, { comment }),
  activateContract: (id, comment) => api.post(`/contracts/${id}/activate`, { comment }),
  getContractStats: () => api.get('/contracts/stats/overview'),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  activateUser: (id) => api.post(`/users/${id}/activate`),
  getUserStats: () => api.get('/users/stats/overview'),
};

// Contractor API
export const contractorAPI = {
  getContractors: (params) => api.get('/contractors', { params }),
  getContractor: (id) => api.get(`/contractors/${id}`),
  createContractor: (contractorData) => api.post('/contractors', contractorData),
  updateContractor: (id, contractorData) => api.put(`/contractors/${id}`, contractorData),
  deleteContractor: (id) => api.delete(`/contractors/${id}`),
  activateContractor: (id) => api.post(`/contractors/${id}/activate`),
  suspendContractor: (id) => api.post(`/contractors/${id}/suspend`),
  getContractorStats: () => api.get('/contractors/stats/overview'),
};

// Report API
export const reportAPI = {
  getContractSummary: (params) => api.get('/reports/contracts/summary', { params }),
  getContractTrends: (params) => api.get('/reports/contracts/trends', { params }),
  getExpiringContracts: (params) => api.get('/reports/contracts/expiring', { params }),
  getUserActivity: (params) => api.get('/reports/users/activity', { params }),
  getDashboardData: () => api.get('/reports/dashboard'),
};

// Audit API
export const auditAPI = {
  getAuditLogs: (params) => api.get('/audit', { params }),
  getAuditStats: (params) => api.get('/audit/stats', { params }),
};

// Security API
export const securityAPI = {
  getSettings: () => api.get('/security/settings'),
  updateSettings: (settings) => api.put('/security/settings', settings),
  changePassword: (passwordData) => api.post('/security/change-password', passwordData),
  getAlerts: () => api.get('/security/alerts'),
  getActivities: () => api.get('/security/activities'),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
  getSystemInfo: () => api.get('/settings/system-info'),
  createBackup: () => api.post('/settings/backup'),
  checkUpdates: () => api.post('/settings/check-updates'),
  clearCache: () => api.post('/settings/clear-cache'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  uploadAvatar: (formData) => api.post('/auth/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getActivityLog: (params) => api.get('/auth/activity-log', { params }),
};

export default api;
