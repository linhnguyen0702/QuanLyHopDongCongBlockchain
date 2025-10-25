require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Contract = require('./models/Contract');
const Contractor = require('./models/Contractor');
const AuditLog = require('./models/AuditLog');
const SecuritySettings = require('./models/SecuritySettings');
const SystemSettings = require('./models/SystemSettings');

const clearAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear all data except admin user
    await Contract.deleteMany({});
    console.log('✅ Cleared contracts');

    await Contractor.deleteMany({});
    console.log('✅ Cleared contractors');

    await AuditLog.deleteMany({});
    console.log('✅ Cleared audit logs');

    await SecuritySettings.deleteMany({});
    console.log('✅ Cleared security settings');

    await SystemSettings.deleteMany({});
    console.log('✅ Cleared system settings');

    // Keep admin user but clear others
    await User.deleteMany({ email: { $ne: 'admin@example.com' } });
    console.log('✅ Cleared users (kept admin)');

    console.log('🎉 All data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

clearAll();
