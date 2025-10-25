require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Contractor = require('./models/Contractor');
const User = require('./models/User');

const seedContractors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    await Contractor.deleteMany({});
    console.log('✅ Cleared existing contractors');

    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please ensure default admin user is created.');
      return;
    }

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
      },
      {
        contractorCode: 'NT004',
        contractorName: 'Công ty TNHH Tư vấn thiết kế GHI',
        contactPerson: 'Phạm Thị D',
        email: 'consulting@ghi-design.com',
        phone: '0741852963',
        address: '321 Đường GHI, Quận 4, TP.HCM',
        taxCode: '0741852963',
        businessLicense: '41D4567890',
        contractorType: 'consulting',
        status: 'active',
        rating: 5,
        description: 'Tư vấn thiết kế kiến trúc, kết cấu và MEP cho các dự án lớn',
        createdBy: adminUser._id
      },
      {
        contractorCode: 'NT005',
        contractorName: 'Công ty TNHH Vật liệu xây dựng JKL',
        contactPerson: 'Hoàng Văn E',
        email: 'materials@jkl-construction.com',
        phone: '0852741963',
        address: '654 Đường JKL, Quận 5, TP.HCM',
        taxCode: '0852741963',
        businessLicense: '41E5678901',
        contractorType: 'supply',
        status: 'suspended',
        rating: 2,
        description: 'Cung cấp vật liệu xây dựng chất lượng cao',
        createdBy: adminUser._id
      },
      {
        contractorCode: 'NT006',
        contractorName: 'Công ty CP Xây dựng MNO',
        contactPerson: 'Vũ Thị F',
        email: 'construction@mno-build.com',
        phone: '0963852741',
        address: '987 Đường MNO, Quận 6, TP.HCM',
        taxCode: '0963852741',
        businessLicense: '41F6789012',
        contractorType: 'construction',
        status: 'inactive',
        rating: 3,
        description: 'Chuyên thi công các công trình hạ tầng và giao thông',
        createdBy: adminUser._id
      },
      {
        contractorCode: 'NT007',
        contractorName: 'Công ty TNHH Dịch vụ vệ sinh PQR',
        contactPerson: 'Đặng Văn G',
        email: 'cleaning@pqr-service.com',
        phone: '0147258369',
        address: '147 Đường PQR, Quận 7, TP.HCM',
        taxCode: '0147258369',
        businessLicense: '41G7890123',
        contractorType: 'service',
        status: 'active',
        rating: 4,
        description: 'Dịch vụ vệ sinh công nghiệp và bảo trì tòa nhà',
        createdBy: adminUser._id
      },
      {
        contractorCode: 'NT008',
        contractorName: 'Công ty TNHH Cung cấp năng lượng STU',
        contactPerson: 'Bùi Thị H',
        email: 'energy@stu-power.com',
        phone: '0258147369',
        address: '258 Đường STU, Quận 8, TP.HCM',
        taxCode: '0258147369',
        businessLicense: '41H8901234',
        contractorType: 'supply',
        status: 'blacklisted',
        rating: 1,
        description: 'Cung cấp hệ thống năng lượng mặt trời và điện gió',
        createdBy: adminUser._id
      }
    ];

    await Contractor.insertMany(contractors);
    console.log('✅ Created contractors successfully');
    console.log('🎉 Contractors seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding contractors:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedContractors();
