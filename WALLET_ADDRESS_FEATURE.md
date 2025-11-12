# Tính năng Địa chỉ Ví Blockchain

## Tổng quan

Hệ thống đã được cập nhật để cho phép người dùng lưu và quản lý địa chỉ ví Ethereum trong thông tin cá nhân.

## Lợi ích

✅ **Liên kết người dùng với Blockchain**: Mỗi người dùng có địa chỉ ví riêng để ký và xác thực giao dịch  
✅ **Kiểm tra quyền truy cập**: Xác định người dùng nào có quyền thực hiện các thao tác blockchain  
✅ **Audit trail**: Theo dõi ai đã thực hiện các hành động trên blockchain  
✅ **Tự động hóa**: Không cần nhập địa chỉ ví mỗi lần thực hiện giao dịch

## Thay đổi kỹ thuật

### 1. Backend - Model User

**File**: `backend/models/User.js`

Đã thêm trường mới:

```javascript
walletAddress: {
  type: String,
  trim: true,
  lowercase: true,
  validate: {
    validator: function(v) {
      // Validate Ethereum address format if provided
      if (!v) return true; // Allow empty
      return /^0x[a-fA-F0-9]{40}$/.test(v);
    },
    message: 'Invalid Ethereum wallet address format'
  }
}
```

### 2. Backend - Route Auth

**File**: `backend/routes/auth.js`

Đã cập nhật route `PUT /api/auth/profile` để cho phép cập nhật `walletAddress`:

```javascript
const allowedUpdates = [
  "username",
  "email",
  "fullName",
  "phone",
  "department",
  "position",
  "walletAddress", // ✅ Thêm mới
];
```

### 3. Backend - Validation

**File**: `backend/middleware/validation.js`

Đã thêm validation cho địa chỉ ví:

```javascript
updateProfile: Joi.object({
  // ... các trường khác
  walletAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Địa chỉ ví Ethereum không hợp lệ (phải bắt đầu bằng 0x và có 40 ký tự hex)'
    }),
}),
```

### 4. Frontend - Profile Page

**File**: `frontend/src/pages/Profile/Profile.js`

Đã thêm trường nhập liệu cho địa chỉ ví:

```jsx
<TextField
  fullWidth
  label="Địa chỉ ví Blockchain"
  value={user?.walletAddress || ""}
  disabled={!isEditing}
  onChange={(e) => onChange && onChange({ walletAddress: e.target.value })}
  placeholder="0x..."
  helperText={
    isEditing ? "Địa chỉ ví Ethereum (bắt đầu bằng 0x và có 42 ký tự)" : ""
  }
  InputProps={{
    startAdornment: <SecurityIcon sx={{ mr: 1, color: "text.secondary" }} />,
  }}
/>
```

## Cách sử dụng

### Đối với người dùng

1. Đăng nhập vào hệ thống
2. Vào trang **Profile** (Thông tin cá nhân)
3. Nhấn nút **"Chỉnh sửa"**
4. Nhập địa chỉ ví Ethereum của bạn vào trường **"Địa chỉ ví Blockchain"**
   - Định dạng: `0x` theo sau bởi 40 ký tự hex (0-9, a-f)
   - Ví dụ: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
5. Nhấn **"Lưu"** để cập nhật

### Validate

- Địa chỉ ví phải bắt đầu bằng `0x`
- Có đúng 42 ký tự (bao gồm cả `0x`)
- Chỉ chứa các ký tự hex (0-9, a-f, A-F)
- Có thể để trống nếu chưa có ví

## API Endpoint

### Cập nhật Profile

**Endpoint**: `PUT /api/auth/profile`

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0123456789",
  "department": "IT",
  "position": "Developer",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response**:

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com",
      "fullName": "Nguyễn Văn A",
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
      // ... các trường khác
    }
  }
}
```

## Lưu ý kỹ thuật

1. **Chuyển thành chữ thường**: Địa chỉ ví sẽ được tự động chuyển thành chữ thường khi lưu
2. **Optional field**: Trường này là tùy chọn, người dùng có thể để trống
3. **Validation**: Hệ thống sẽ validate định dạng địa chỉ Ethereum trước khi lưu
4. **Security**: Địa chỉ ví là thông tin công khai, không phải private key

## Tích hợp với Blockchain

Địa chỉ ví này có thể được sử dụng để:

- Xác định người tạo/phê duyệt hợp đồng trên blockchain
- Tracking các transaction của người dùng
- Authorization cho các smart contract operations
- Audit log cho các blockchain activities

## Ví dụ Ethereum Addresses hợp lệ

```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359
```

## Troubleshooting

### Lỗi: "Invalid Ethereum wallet address format"

- Kiểm tra địa chỉ ví có bắt đầu bằng `0x` không
- Kiểm tra độ dài có đúng 42 ký tự không (bao gồm `0x`)
- Kiểm tra chỉ chứa các ký tự hex (0-9, a-f)

### Không thể cập nhật

- Đảm bảo bạn đã đăng nhập
- Kiểm tra quyền truy cập của bạn
- Xem console log để biết chi tiết lỗi

---

**Ngày cập nhật**: 12/11/2025  
**Phiên bản**: 1.0.0
