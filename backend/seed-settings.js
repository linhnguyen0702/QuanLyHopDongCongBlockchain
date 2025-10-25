require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const SecuritySettings = require('./models/SecuritySettings');
const SystemSettings = require('./models/SystemSettings');

const seedSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Seed Security Settings
    await SecuritySettings.deleteMany({});
    console.log('✅ Cleared existing security settings');

    const securitySettings = new SecuritySettings({
      twoFactorAuth: false,
      passwordPolicy: true,
      sessionTimeout: true,
      ipWhitelist: false,
      auditLogging: true,
      encryption: true,
      backupEnabled: true,
      autoLogout: true
    });

    await securitySettings.save();
    console.log('✅ Created security settings successfully');

    // Seed System Settings
    await SystemSettings.deleteMany({});
    console.log('✅ Cleared existing system settings');

    const systemSettings = new SystemSettings({
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
    });

    await systemSettings.save();
    console.log('✅ Created system settings successfully');
    console.log('🎉 Settings seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedSettings();
