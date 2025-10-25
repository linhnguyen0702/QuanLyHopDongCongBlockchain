# Database Seeding Scripts

Các script để seed dữ liệu mẫu vào database.

## Scripts có sẵn

### 1. `seed-all.js`
Seed tất cả dữ liệu mẫu bao gồm:
- Contractors (8 nhà thầu mẫu)
- Contracts (3 hợp đồng mẫu)
- Audit Logs (8 bản ghi audit mẫu)
- Security Settings (cài đặt bảo mật mặc định)
- System Settings (cài đặt hệ thống mặc định)

```bash
node seed-all.js
```

### 2. `seed-contractors.js`
Chỉ seed dữ liệu contractors mẫu.

```bash
node seed-contractors.js
```

### 3. `seed-audit-logs.js`
Chỉ seed dữ liệu audit logs mẫu.

```bash
node seed-audit-logs.js
```

### 4. `seed-settings.js`
Chỉ seed dữ liệu settings mẫu.

```bash
node seed-settings.js
```

### 5. `clear-all.js`
Xóa tất cả dữ liệu mẫu (giữ lại admin user).

```bash
node clear-all.js
```

## Lưu ý

- Tất cả scripts sẽ xóa dữ liệu hiện tại trước khi seed dữ liệu mới
- Admin user (admin@example.com / password123) sẽ được giữ lại
- Scripts sẽ tự động kết nối và ngắt kết nối database
- Đảm bảo file `config.env` đã được cấu hình đúng trước khi chạy

## Dữ liệu mẫu

### Contractors
- 8 nhà thầu với các loại khác nhau (xây dựng, cung cấp, dịch vụ, tư vấn)
- Các trạng thái khác nhau (hoạt động, tạm dừng, cấm)
- Đánh giá từ 1-5 sao

### Contracts
- 3 hợp đồng mẫu với các trạng thái khác nhau
- Giá trị từ 150-450 triệu VNĐ
- Các phòng ban khác nhau

### Audit Logs
- 8 bản ghi audit mẫu
- Các loại hành động khác nhau (tạo, cập nhật, xóa, đăng nhập, v.v.)
- Timestamp và IP address mẫu

### Settings
- Security settings với các tùy chọn bảo mật mặc định
- System settings với cấu hình hệ thống mặc định
