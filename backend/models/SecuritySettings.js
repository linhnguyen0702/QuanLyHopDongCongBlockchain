const mongoose = require('mongoose');

const securitySettingsSchema = new mongoose.Schema({
  twoFactorAuth: {
    type: Boolean,
    default: false
  },
  passwordPolicy: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Boolean,
    default: true
  },
  sessionTimeoutMinutes: {
    type: Number,
    default: 30
  },
  ipWhitelist: {
    type: Boolean,
    default: false
  },
  allowedIPs: [{
    type: String
  }],
  auditLogging: {
    type: Boolean,
    default: true
  },
  encryption: {
    type: Boolean,
    default: true
  },
  backupEnabled: {
    type: Boolean,
    default: true
  },
  autoLogout: {
    type: Boolean,
    default: true
  },
  passwordMinLength: {
    type: Number,
    default: 8
  },
  passwordRequireUppercase: {
    type: Boolean,
    default: true
  },
  passwordRequireLowercase: {
    type: Boolean,
    default: true
  },
  passwordRequireNumbers: {
    type: Boolean,
    default: true
  },
  passwordRequireSpecialChars: {
    type: Boolean,
    default: true
  },
  maxLoginAttempts: {
    type: Number,
    default: 5
  },
  lockoutDuration: {
    type: Number,
    default: 15 // minutes
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
securitySettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

// Static method to update settings
securitySettingsSchema.statics.updateSettings = async function(updateData, userId) {
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

module.exports = mongoose.model('SecuritySettings', securitySettingsSchema);
