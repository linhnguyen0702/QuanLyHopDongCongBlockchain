const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // General Settings
  language: {
    type: String,
    default: 'vi',
    enum: ['vi', 'en']
  },
  timezone: {
    type: String,
    default: 'Asia/Ho_Chi_Minh'
  },
  dateFormat: {
    type: String,
    default: 'DD/MM/YYYY',
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
  },
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR']
  },
  
  // Appearance Settings
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark', 'auto']
  },
  primaryColor: {
    type: String,
    default: '#7c3aed'
  },
  fontSize: {
    type: String,
    default: 'medium',
    enum: ['small', 'medium', 'large']
  },
  compactMode: {
    type: Boolean,
    default: false
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: false
  },
  contractAlerts: {
    type: Boolean,
    default: true
  },
  systemAlerts: {
    type: Boolean,
    default: true
  },
  
  // System Settings
  autoBackup: {
    type: Boolean,
    default: true
  },
  backupFrequency: {
    type: String,
    default: 'daily',
    enum: ['daily', 'weekly', 'monthly']
  },
  dataRetention: {
    type: String,
    default: '1year',
    enum: ['6months', '1year', '2years', 'forever']
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // Email Settings
  smtpHost: {
    type: String,
    default: 'smtp.gmail.com'
  },
  smtpPort: {
    type: Number,
    default: 587
  },
  smtpUser: {
    type: String,
    default: ''
  },
  smtpPassword: {
    type: String,
    default: ''
  },
  fromEmail: {
    type: String,
    default: 'noreply@company.com'
  },
  fromName: {
    type: String,
    default: 'Contract Management System'
  },
  
  // System Info
  systemVersion: {
    type: String,
    default: 'v1.0.0'
  },
  databaseVersion: {
    type: String,
    default: 'MongoDB 6.0'
  },
  nodeVersion: {
    type: String,
    default: 'v18.20.3'
  },
  reactVersion: {
    type: String,
    default: 'v18.2.0'
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Static method to get current settings
systemSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

// Static method to update settings
systemSettingsSchema.statics.updateSettings = async function(updateData, userId) {
  const settings = await this.findOne();
  if (!settings) {
    const newSettings = new this({ ...updateData, updatedBy: userId });
    await newSettings.save();
    return newSettings;
  }
  
  Object.assign(settings, updateData);
  settings.updatedBy = userId;
  settings.lastUpdated = new Date();
  await settings.save();
  
  return settings;
};

// Static method to get system info
systemSettingsSchema.statics.getSystemInfo = async function() {
  const settings = await this.getCurrentSettings();
  const User = require('./User');
  const Contract = require('./Contract');
  
  const totalUsers = await User.countDocuments();
  const totalContracts = await Contract.countDocuments();
  
  return {
    systemVersion: settings.systemVersion,
    databaseVersion: settings.databaseVersion,
    nodeVersion: settings.nodeVersion,
    reactVersion: settings.reactVersion,
    totalUsers,
    totalContracts,
    lastUpdated: settings.lastUpdated
  };
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
