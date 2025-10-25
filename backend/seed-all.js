require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Contract = require('./models/Contract');
const Contractor = require('./models/Contractor');
const AuditLog = require('./models/AuditLog');
const SecuritySettings = require('./models/SecuritySettings');
const SystemSettings = require('./models/SystemSettings');

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Contract.deleteMany({});
    await Contractor.deleteMany({});
    await AuditLog.deleteMany({});
    await SecuritySettings.deleteMany({});
    await SystemSettings.deleteMany({});
    console.log('✅ Cleared existing data');

    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please ensure default admin user is created.');
      return;
    }

    // Seed Contractors
    const contractors = [
      {
        contractorCode: 'NT001',
        contractorName: 'Công ty TNHH Xây dựng ABC',
        contactPerson: 'Nguyễn Văn A',
        email: 'contact@abc-construction.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        taxCode: '0123456789',
        businessLicense: '41A1234567',
        contractorType: 'construction',
        status: 'active',
        rating: 5,
        description: 'Công ty chuyên về xây dựng dân dụng và công nghiệp với hơn 10 năm kinh nghiệm',
        createdBy: adminUser._id
      },
      {
        contractorCode: 'NT002',
        contractorName: 'Công ty CP Cung cấp thiết bị XYZ',
        contactPerson: 'Trần Thị B',
        email: 'info@xyz-supply.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        taxCode: '0987654321',
        businessLicense: '41B2345678',
        contractorType: 'supply',
        status: 'active',
        rating: 4,
        description: 'Chuyên cung cấp thiết bị điện, nước và vật liệu xây dựng',
        createdBy: adminUser._id
      },
      {
        contractorCode: 'NT003',
        contractorName: 'Công ty TNHH Dịch vụ kỹ thuật DEF',
        contactPerson: 'Lê Văn C',
        email: 'service@def-tech.com',
        phone: '0369258147',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        taxCode: '0369258147',
        businessLicense: '41C3456789',
        contractorType: 'service',
        status: 'active',
        rating: 4,
        description: 'Dịch vụ bảo trì, sửa chữa và nâng cấp hệ thống kỹ thuật',
        createdBy: adminUser._id
      }
    ];

    const createdContractors = await Contractor.insertMany(contractors);
    console.log('✅ Created contractors successfully');

    // Seed Contracts
    const contracts = [
      {
        contractNumber: 'HD001',
        contractName: 'Xây dựng cầu Nhật Tân 2',
        contractor: 'Công ty TNHH Xây dựng ABC',
        contractValue: 450000000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        department: 'Giao thông vận tải',
        responsiblePerson: 'Nguyễn Văn A',
        contractType: 'construction',
        status: 'approved',
        createdBy: adminUser._id,
        approvedBy: adminUser._id,
        approvedAt: new Date('2024-01-15')
      },
      {
        contractNumber: 'HD002',
        contractName: 'Nâng cấp hệ thống điện',
        contractor: 'Công ty CP Cung cấp thiết bị XYZ',
        contractValue: 250000000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        department: 'Năng lượng',
        responsiblePerson: 'Trần Thị B',
        contractType: 'supply',
        status: 'active',
        createdBy: adminUser._id,
        approvedBy: adminUser._id,
        approvedAt: new Date('2024-02-10')
      },
      {
        contractNumber: 'HD003',
        contractName: 'Bảo trì hệ thống kỹ thuật',
        contractor: 'Công ty TNHH Dịch vụ kỹ thuật DEF',
        contractValue: 150000000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        department: 'Công nghệ thông tin',
        responsiblePerson: 'Lê Văn C',
        contractType: 'service',
        status: 'pending',
        createdBy: adminUser._id
      }
    ];

    await Contract.insertMany(contracts);
    console.log('✅ Created contracts successfully');

    // Seed Audit Logs
    const auditLogs = [
      {
        type: 'contract',
        action: 'created',
        description: 'Tạo hợp đồng mới "Xây dựng cầu Nhật Tân 2"',
        details: 'Hợp đồng số: HD001, Giá trị: 450,000,000 VNĐ',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.1'
      },
      {
        type: 'contract',
        action: 'approved',
        description: 'Phê duyệt hợp đồng "Nâng cấp hệ thống điện"',
        details: 'Hợp đồng số: HD002, Trạng thái: Đã duyệt',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.2'
      },
      {
        type: 'contractor',
        action: 'created',
        description: 'Tạo nhà thầu mới "Công ty TNHH Xây dựng ABC"',
        details: 'Mã nhà thầu: NT001, Loại: Xây dựng',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.3'
      },
      {
        type: 'security',
        action: 'login',
        description: 'Đăng nhập hệ thống',
        details: 'IP: 192.168.1.4, Browser: Chrome',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.4'
      }
    ];

    await AuditLog.insertMany(auditLogs);
    console.log('✅ Created audit logs successfully');

    // Seed Security Settings
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

    console.log('🎉 All data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedAll();
