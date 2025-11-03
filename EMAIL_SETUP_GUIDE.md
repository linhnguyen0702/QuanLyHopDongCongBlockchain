# Hướng dẫn cấu hình Email Service

## 📧 Bước 1: Cài đặt package nodemailer

```bash
cd backend
npm install nodemailer
```

## 🔐 Bước 2: Tạo App Password cho Gmail

Vì Gmail không cho phép sử dụng mật khẩu thường để gửi email qua ứng dụng, bạn cần tạo **App Password**:

### Các bước tạo App Password:

1. **Đăng nhập Gmail** của bạn (`linhyang0702@gmail.com`)

2. **Bật xác thực 2 bước (2FA)**:

   - Vào [myaccount.google.com](https://myaccount.google.com)
   - Chọn **Security** (Bảo mật)
   - Tìm **2-Step Verification** và bật nó lên
   - Làm theo hướng dẫn để hoàn tất

3. **Tạo App Password**:

   - Sau khi bật 2FA, vào lại **Security**
   - Tìm **App passwords** (Mật khẩu ứng dụng)
   - Chọn **Select app** → **Mail**
   - Chọn **Select device** → **Other** → Nhập tên: "Contract Management System"
   - Click **Generate**
   - Gmail sẽ hiển thị mật khẩu 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)
   - **Sao chép mật khẩu này** (bỏ khoảng trắng)

4. **Cập nhật file config.env**:
   ```env
   MAIL_USER=linhyang0702@gmail.com
   MAIL_PASS=abcdefghijklmnop    # Thay bằng App Password bạn vừa tạo (16 ký tự, không có khoảng trắng)
   ```

## ✅ Bước 3: Kiểm tra cấu hình

File `backend/config.env` đã có:

```env
MAIL_USER=linhyang0702@gmail.com
MAIL_PASS=uvzhjwhduxfdzyhe     # App Password hiện tại
```

**Lưu ý**: Nếu mật khẩu hiện tại không hoạt động, hãy tạo App Password mới theo hướng dẫn trên.

## 🚀 Bước 4: Khởi động lại server

```bash
cd backend
npm run dev
```

Bạn sẽ thấy log:

```
✅ Email service is ready to send messages
```

## 📝 Cách sử dụng Email Service

### 1. Gửi OTP (đã tích hợp tự động):

```javascript
const { sendOTP } = require("./services/emailService");

await sendOTP(userEmail, otpCode, userName);
```

### 2. Gửi email tùy chỉnh:

```javascript
const { sendEmail } = require("./services/emailService");

await sendEmail("user@example.com", "Tiêu đề email", "<h1>Nội dung HTML</h1>");
```

### 3. Gửi email chào mừng:

```javascript
const { sendWelcomeEmail } = require("./services/emailService");

await sendWelcomeEmail(email, userName, temporaryPassword);
```

## 🧪 Kiểm tra hoạt động

1. Bật 2FA trong Security Settings
2. Đăng nhập vào hệ thống
3. Kiểm tra email để nhận OTP
4. Email sẽ có:
   - Tiêu đề: "Mã xác thực OTP - Đăng nhập hệ thống"
   - Nội dung HTML đẹp với mã OTP 6 chữ số
   - Cảnh báo về thời gian hết hạn (10 phút)

## ⚠️ Xử lý lỗi

Nếu gửi email thất bại:

- Hệ thống vẫn tạo OTP và lưu vào database
- OTP được log ra console để backup
- User vẫn có thể đăng nhập nếu nhập đúng OTP

## 📊 Log trong Console

Khi gửi OTP thành công:

```
✅ [2FA] OTP sent to user@example.com
✅ OTP email sent successfully: <message-id>
```

Khi gửi thất bại:

```
❌ Error sending OTP email: [error details]
🔑 [BACKUP] OTP for user@example.com: 123456
```

## 🔒 Bảo mật

- App Password được lưu trong biến môi trường (không commit vào Git)
- OTP hết hạn sau 10 phút
- Email có cảnh báo không chia sẻ OTP với ai
- Transporter được verify khi khởi động server

## 📧 Template Email

Email OTP có template đẹp với:

- ✅ Header màu xanh chuyên nghiệp
- ✅ Box OTP nổi bật với font size lớn
- ✅ Cảnh báo về thời gian hết hạn
- ✅ Responsive design
- ✅ Footer với thông tin hệ thống

## 🎯 Tính năng đã triển khai

- [x] Service gửi email với Nodemailer
- [x] Template HTML đẹp cho OTP
- [x] Tích hợp vào route `/api/auth/login`
- [x] Xử lý lỗi và fallback
- [x] Log chi tiết để debug
- [x] Verify email configuration khi khởi động
- [x] Support gửi email chào mừng user mới

---

**Lưu ý**: Đảm bảo App Password trong `config.env` là chính xác và không có khoảng trắng!
