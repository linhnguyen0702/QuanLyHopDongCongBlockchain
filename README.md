# Website Quản Lý Hợp Đồng Công

Hệ thống quản lý hợp đồng dự án nhà nước sử dụng công nghệ blockchain Hyperledger Fabric.

## Công nghệ sử dụng

- **Frontend**: ReactJS, Material-UI, Axios, React Query
- **Backend**: Node.js, Express.js, Hyperledger Fabric SDK
- **Blockchain**: Hyperledger Fabric
- **Authentication**: JWT
- **Database**: MongoDB (cho metadata), Hyperledger Fabric (cho dữ liệu chính)

## Cấu trúc dự án

```
quan-ly-hop-dong-cong/
├── frontend/                    # ReactJS Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── ...
│   └── package.json
├── backend/                    # Node.js Backend
│   ├── routes/                # API routes
│   ├── models/                # Database models
│   ├── middleware/            # Custom middleware
│   ├── services/              # Business logic
│   └── ...
├── chaincode/                  # Hyperledger Smart Contracts
│   └── contract-chaincode.go
├── network/                    # Hyperledger Network Configuration
│   ├── docker-compose.yml
│   ├── crypto-config.yaml
│   ├── configtx.yaml
│   └── scripts/
└── package.json
```

## Tính năng chính

### ✅ Đã hoàn thành
- **Authentication & Authorization**: Đăng nhập, đăng xuất, phân quyền
- **Quản lý hợp đồng**: Tạo, xem, sửa, xóa hợp đồng
- **Dashboard**: Tổng quan thống kê
- **Blockchain Integration**: Tích hợp Hyperledger Fabric
- **Responsive UI**: Giao diện thân thiện với Material-UI

### 🚧 Đang phát triển
- **Quản lý người dùng**: CRUD operations cho users
- **Báo cáo chi tiết**: Biểu đồ, xuất báo cáo
- **File upload**: Đính kèm tài liệu
- **Notifications**: Thông báo real-time
- **Advanced search**: Tìm kiếm nâng cao

## Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **Docker**: >= 20.0.0
- **Docker Compose**: >= 2.0.0
- **MongoDB**: >= 5.0.0 (optional, cho metadata)

## Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd quan-ly-hop-dong-cong
```

### 2. Cài đặt dependencies

```bash
# Cài đặt tất cả dependencies
npm run install-all

# Hoặc cài đặt từng phần
npm install                    # Root dependencies
cd backend && npm install      # Backend dependencies
cd ../frontend && npm install  # Frontend dependencies
```

### 3. Cấu hình môi trường

```bash
# Copy file cấu hình
cp backend/config.env.example backend/config.env

# Chỉnh sửa các biến môi trường trong backend/config.env
```

### 4. Khởi động Hyperledger Network

```bash
cd network

# Cấp quyền thực thi cho scripts
chmod +x start-network.sh
chmod +x stop-network.sh

# Khởi động network
./start-network.sh
```

### 5. Chạy ứng dụng

```bash
# Từ thư mục root
npm run dev

# Hoặc chạy riêng biệt
npm run server  # Backend only
npm run client  # Frontend only
```

### 6. Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

## Demo Account

```
Email: admin@example.com
Password: password123
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu

### Contracts
- `GET /api/contracts` - Lấy danh sách hợp đồng (có pagination, filter)
- `POST /api/contracts` - Tạo hợp đồng mới
- `GET /api/contracts/:id` - Lấy thông tin hợp đồng
- `PUT /api/contracts/:id` - Cập nhật hợp đồng
- `DELETE /api/contracts/:id` - Xóa hợp đồng
- `POST /api/contracts/:id/approve` - Phê duyệt hợp đồng
- `POST /api/contracts/:id/activate` - Kích hoạt hợp đồng
- `GET /api/contracts/stats/overview` - Thống kê hợp đồng

### Users (Admin only)
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng
- `POST /api/users/:id/activate` - Kích hoạt người dùng

### Reports (Manager/Admin)
- `GET /api/reports/contracts/summary` - Báo cáo tổng hợp hợp đồng
- `GET /api/reports/contracts/trends` - Xu hướng hợp đồng
- `GET /api/reports/contracts/expiring` - Hợp đồng sắp hết hạn
- `GET /api/reports/users/activity` - Hoạt động người dùng
- `GET /api/reports/dashboard` - Dữ liệu dashboard

## Blockchain Integration

### Smart Contract Functions
- `CreateContract` - Tạo hợp đồng mới trên blockchain
- `UpdateContract` - Cập nhật hợp đồng
- `ApproveContract` - Phê duyệt hợp đồng
- `ActivateContract` - Kích hoạt hợp đồng
- `GetContract` - Lấy thông tin hợp đồng
- `GetAllContracts` - Lấy tất cả hợp đồng
- `GetContractHistory` - Lấy lịch sử thay đổi

### Network Configuration
- **Channel**: mychannel
- **Chaincode**: contract-chaincode
- **Organization**: Org1
- **Orderer**: orderer.example.com:7050
- **Peer**: peer0.org1.example.com:7051

## Phân quyền

### Roles
- **Admin**: Toàn quyền truy cập
- **Manager**: Quản lý hợp đồng, xem báo cáo
- **User**: Tạo và quản lý hợp đồng của mình

### Permissions
- **Admin**: Tất cả quyền
- **Manager**: 
  - Xem tất cả hợp đồng
  - Phê duyệt/kích hoạt hợp đồng
  - Xem báo cáo
- **User**:
  - Tạo hợp đồng
  - Xem/sửa hợp đồng của mình
  - Xem dashboard

## Troubleshooting

### Lỗi thường gặp

1. **Docker không chạy**
   ```bash
   # Kiểm tra Docker
   docker --version
   docker-compose --version
   ```

2. **Port đã được sử dụng**
   ```bash
   # Kiểm tra port
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   ```

3. **Hyperledger Network lỗi**
   ```bash
   # Dừng và khởi động lại
   cd network
   ./stop-network.sh
   ./start-network.sh
   ```

4. **Dependencies lỗi**
   ```bash
   # Xóa node_modules và cài lại
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development

### Cấu trúc code

- **Frontend**: Component-based architecture với React hooks
- **Backend**: MVC pattern với Express.js
- **Database**: Mongoose ODM cho MongoDB
- **Blockchain**: Hyperledger Fabric SDK

### Coding Standards

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
