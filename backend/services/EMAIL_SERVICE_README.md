# 📧 Email Service - Backend

Service gửi email cho hệ thống Quản lý Hợp đồng Công.

## 📋 Mục lục

- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Sử dụng](#sử-dụng)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🚀 Cài đặt

```bash
npm install nodemailer
```

## ⚙️ Cấu hình

### 1. Tạo App Password cho Gmail

1. Truy cập [Google Account Security](https://myaccount.google.com/security)
2. Bật **2-Step Verification**
3. Tạo **App Password**:
   - Chọn app: **Mail**
   - Chọn device: **Other** → Nhập "Contract Management"
   - Copy mật khẩu 16 ký tự (không có khoảng trắng)

### 2. Cập nhật config.env

```env
MAIL_USER=your-email@gmail.com
MAIL_PASS=abcdefghijklmnop  # App Password (16 ký tự)
```

## 📖 Sử dụng

### Import Service

```javascript
const {
  sendOTP,
  sendEmail,
  sendWelcomeEmail,
} = require("./services/emailService");
```

### Gửi OTP (2FA)

```javascript
// Tự động được gọi khi login với 2FA enabled
await sendOTP(
  "user@example.com", // Email người nhận
  "123456", // Mã OTP 6 chữ số
  "Nguyễn Văn A" // Tên người dùng (optional)
);
```

### Gửi Email tùy chỉnh

```javascript
await sendEmail("user@example.com", "Tiêu đề email", "<h1>Nội dung HTML</h1>");
```

### Gửi Email chào mừng

```javascript
await sendWelcomeEmail(
  "newuser@example.com",
  "Nguyễn Văn B",
  "TempPassword123"
);
```

## 📚 API Reference

### sendOTP(email, otp, userName)

Gửi email OTP cho xác thực 2 yếu tố.

**Parameters:**

- `email` (string): Email người nhận
- `otp` (string): Mã OTP 6 chữ số
- `userName` (string, optional): Tên người dùng. Default: "Người dùng"

**Returns:** Promise<{ success: boolean, messageId: string }>

**Template:** HTML đẹp với:

- Header màu xanh
- Box OTP nổi bật
- Cảnh báo thời gian hết hạn (10 phút)
- Footer chuyên nghiệp

---

### sendEmail(email, subject, htmlContent)

Gửi email với nội dung tùy chỉnh.

**Parameters:**

- `email` (string): Email người nhận
- `subject` (string): Tiêu đề email
- `htmlContent` (string): Nội dung HTML

**Returns:** Promise<{ success: boolean, messageId: string }>

---

### sendWelcomeEmail(email, userName, temporaryPassword)

Gửi email chào mừng người dùng mới.

**Parameters:**

- `email` (string): Email người dùng mới
- `userName` (string): Tên người dùng
- `temporaryPassword` (string): Mật khẩu tạm thời

**Returns:** Promise<{ success: boolean, messageId: string }>

## 🧪 Testing

### Chạy Test

```bash
cd backend
node test-email.js
```

### Output khi thành công:

```
🧪 Bắt đầu test Email Service...

📧 Email User: linhyang0702@gmail.com
🔑 Email Pass: ✅ Đã cấu hình

📨 Test 1: Gửi OTP email...
✅ OTP email sent successfully: <message-id>
✅ Test 1 PASSED: OTP đã được gửi thành công!

📨 Test 2: Gửi email thông báo...
✅ Email sent successfully: <message-id>
✅ Test 2 PASSED: Email thông báo đã được gửi thành công!

📨 Test 3: Gửi email chào mừng...
✅ Email sent successfully: <message-id>
✅ Test 3 PASSED: Email chào mừng đã được gửi thành công!

═══════════════════════════════════════════════
✅ TẤT CẢ TESTS PASSED!
═══════════════════════════════════════════════
```

## 🔍 Troubleshooting

### Lỗi: "Invalid login"

**Nguyên nhân:**

- Chưa bật 2FA cho Gmail
- Sử dụng mật khẩu thường thay vì App Password
- App Password không chính xác

**Giải pháp:**

1. Bật 2-Step Verification
2. Tạo App Password mới
3. Cập nhật `MAIL_PASS` trong config.env (không có khoảng trắng)

---

### Lỗi: "Connection timeout"

**Nguyên nhân:**

- Không có kết nối internet
- Firewall chặn port 587 hoặc 465

**Giải pháp:**

1. Kiểm tra kết nối internet
2. Thử thay đổi cấu hình transporter:

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
```

---

### Email không gửi được nhưng không có lỗi

**Nguyên nhân:**

- Email bị đánh dấu spam
- Gmail block gửi email

**Giải pháp:**

1. Kiểm tra thư mục Spam/Junk
2. Thêm email vào whitelist
3. Kiểm tra Gmail Security settings

---

### Email bị delay

**Nguyên nhân:**

- Server Gmail đang bận
- Rate limit

**Giải pháp:**

- Đợi vài phút
- Email thường đến trong vòng 1-2 phút

## 📊 Logs

### Khi khởi động server

```
✅ Email service is ready to send messages
```

### Khi gửi OTP thành công

```
✅ [2FA] OTP sent to user@example.com
✅ OTP email sent successfully: <message-id>
```

### Khi gửi thất bại

```
❌ Error sending OTP email: [error details]
🔑 [BACKUP] OTP for user@example.com: 123456
```

## 🔒 Bảo mật

- ✅ App Password lưu trong biến môi trường
- ✅ Không commit config.env vào Git
- ✅ Verify transporter khi khởi động
- ✅ OTP hết hạn sau 10 phút
- ✅ Email có cảnh báo bảo mật

## 🎨 Email Templates

### OTP Email

- Header xanh chuyên nghiệp
- Box OTP với font lớn, dễ đọc
- Cảnh báo thời gian hết hạn
- Hướng dẫn bảo mật
- Footer với thông tin hệ thống

### Welcome Email

- Chào mừng người dùng mới
- Thông tin đăng nhập
- Nhắc nhở đổi mật khẩu
- Link hướng dẫn sử dụng

## 📝 Notes

- Gmail có giới hạn gửi: 500 emails/day cho tài khoản thường
- Cho production, nên dùng dịch vụ chuyên nghiệp như SendGrid, AWS SES
- OTP có thời gian hết hạn 10 phút (có thể điều chỉnh trong auth.js)
- Template email responsive, hiển thị tốt trên mobile

## 🔗 Links hữu ích

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [HTML Email Best Practices](https://templates.mailchimp.com/resources/email-client-css-support/)

---

Made with ❤️ for Contract Management System
