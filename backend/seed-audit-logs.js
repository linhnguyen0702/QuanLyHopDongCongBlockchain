require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

const seedAuditLogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    await AuditLog.deleteMany({});
    console.log('✅ Cleared existing audit logs');

    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please ensure default admin user is created.');
      return;
    }

    const logs = [
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
        type: 'user',
        action: 'created',
        description: 'Tạo tài khoản người dùng mới',
        details: 'Email: user@example.com, Vai trò: User',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.3'
      },
      {
        type: 'contractor',
        action: 'updated',
        description: 'Cập nhật thông tin nhà thầu "Công ty ABC"',
        details: 'Cập nhật địa chỉ và số điện thoại',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.4'
      },
      {
        type: 'security',
        action: 'login',
        description: 'Đăng nhập hệ thống',
        details: 'IP: 192.168.1.5, Browser: Chrome',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.5'
      },
      {
        type: 'contract',
        action: 'deleted',
        description: 'Xóa hợp đồng "Dự án hủy bỏ"',
        details: 'Lý do: Dự án bị hủy bỏ',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.6'
      },
      {
        type: 'user',
        action: 'password_change',
        description: 'Thay đổi mật khẩu người dùng',
        details: 'Người dùng admin đã thay đổi mật khẩu',
        performedBy: adminUser._id,
        ipAddress: '192.168.1.7'
      },
      {
        type: 'system',
        action: 'backup',
        description: 'Hệ thống đã tạo bản sao lưu',
        details: 'Sao lưu database thành công',
        performedBy: adminUser._id,
        ipAddress: 'System'
      }
    ];

    await AuditLog.insertMany(logs);
    console.log('✅ Created audit logs successfully');
    console.log('🎉 Audit logs seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding audit logs:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedAuditLogs();
