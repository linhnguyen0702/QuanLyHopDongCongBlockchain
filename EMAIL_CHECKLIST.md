# ✅ Email Service Setup Checklist

## Bước 1: Cài đặt package

```bash
cd backend
npm install nodemailer
```

## Bước 2: Kiểm tra config.env

File `backend/config.env` đã có:

```env
MAIL_USER=linhyang0702@gmail.com
MAIL_PASS=uvzhjwhduxfdzyhe
```

⚠️ **Quan trọng**: Nếu email không gửi được, bạn cần tạo App Password mới:

### Cách tạo App Password:

1. Vào https://myaccount.google.com/security
2. Bật "2-Step Verification" (nếu chưa bật)
3. Tìm "App passwords" → Tạo mới
4. Chọn app: Mail, device: Other
5. Copy mật khẩu 16 ký tự (bỏ khoảng trắng)
6. Cập nhật vào `MAIL_PASS` trong config.env

## Bước 3: Khởi động server

```bash
cd backend
npm run dev
```

Kiểm tra log:

```
✅ Email service is ready to send messages
```

## Bước 4: Test email service

```bash
cd backend
node test-email.js
```

Nếu thành công, bạn sẽ nhận được 3 email test!

## Bước 5: Test thực tế

1. Vào Security Settings trong app
2. Bật 2FA
3. Logout
4. Login lại
5. Kiểm tra email để nhận OTP

## 🎯 Kết quả mong đợi:

- ✅ Server khởi động không lỗi
- ✅ Email service ready
- ✅ Test email thành công
- ✅ Nhận được OTP trong email khi login
- ✅ Email có template đẹp, chuyên nghiệp

## 🐛 Nếu có lỗi:

- Xem file `EMAIL_SETUP_GUIDE.md` để biết chi tiết
- Xem file `backend/services/EMAIL_SERVICE_README.md` cho API docs
- Check log trong console
- Kiểm tra thư mục Spam

## 📁 Files đã tạo:

1. ✅ `backend/services/emailService.js` - Service chính
2. ✅ `backend/routes/auth.js` - Đã tích hợp gửi OTP
3. ✅ `backend/test-email.js` - Script test
4. ✅ `EMAIL_SETUP_GUIDE.md` - Hướng dẫn setup
5. ✅ `backend/services/EMAIL_SERVICE_README.md` - API docs

---

**Quick Start:**

```bash
# Cài package
npm install nodemailer

# Test ngay
node test-email.js
```

Done! 🎉
