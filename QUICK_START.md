# Hướng dẫn cài đặt nhanh

## Yêu cầu hệ thống
- Node.js >= 16.0.0
- Docker Desktop
- Git

## Cài đặt nhanh (5 phút)

### 1. Clone và cài đặt
```bash
git clone <repository-url>
cd quan-ly-hop-dong-cong
npm run install-all
```

### 2. Cấu hình
```bash
# Copy file cấu hình
copy backend\config.env.example backend\config.env
```

### 3. Khởi động Hyperledger Network (Windows)
```bash
cd network
start-network.bat
```

### 4. Chạy ứng dụng
```bash
# Từ thư mục root
npm run dev
```

### 5. Truy cập
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Demo Account
```
Email: admin@example.com
Password: password123
```

## Lưu ý
- Đảm bảo Docker Desktop đang chạy
- Port 3000 và 5000 phải trống
- Lần đầu chạy có thể mất 5-10 phút để tải Docker images

## Troubleshooting
- Nếu lỗi Docker: Khởi động lại Docker Desktop
- Nếu lỗi port: Kiểm tra port 3000, 5000 có đang được sử dụng
- Nếu lỗi dependencies: Chạy `npm run install-all` lại
