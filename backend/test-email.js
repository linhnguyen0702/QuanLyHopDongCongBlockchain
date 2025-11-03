/**
 * Test Email Service
 * Chạy file này để test gửi email OTP
 *
 * Cách chạy: node test-email.js
 */

require("dotenv").config({ path: "./config.env" });
const {
  sendOTP,
  sendEmail,
  sendWelcomeEmail,
} = require("./services/emailService");

async function testEmailService() {
  console.log("\n🧪 Bắt đầu test Email Service...\n");

  // Kiểm tra cấu hình
  console.log("📧 Email User:", process.env.MAIL_USER);
  console.log(
    "🔑 Email Pass:",
    process.env.MAIL_PASS ? "✅ Đã cấu hình" : "❌ Chưa cấu hình"
  );
  console.log("");

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error(
      "❌ Lỗi: Chưa cấu hình MAIL_USER hoặc MAIL_PASS trong config.env"
    );
    console.log(
      "\nVui lòng kiểm tra file EMAIL_SETUP_GUIDE.md để biết cách cấu hình.\n"
    );
    process.exit(1);
  }

  try {
    // Test 1: Gửi OTP
    console.log("📨 Test 1: Gửi OTP email...");
    const testEmail = process.env.MAIL_USER; // Gửi đến chính email của bạn
    const testOTP = "123456";
    const testUserName = "Nguyễn Test User";

    const result = await sendOTP(testEmail, testOTP, testUserName);

    if (result.success) {
      console.log("✅ Test 1 PASSED: OTP đã được gửi thành công!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   📬 Kiểm tra email: ${testEmail}\n`);
    }

    // Test 2: Gửi email đơn giản
    console.log("📨 Test 2: Gửi email thông báo...");
    const result2 = await sendEmail(
      testEmail,
      "Test Email từ Hệ thống",
      "<h2>🎉 Email Test</h2><p>Đây là email test từ hệ thống Quản lý Hợp đồng Công.</p>"
    );

    if (result2.success) {
      console.log("✅ Test 2 PASSED: Email thông báo đã được gửi thành công!");
      console.log(`   Message ID: ${result2.messageId}\n`);
    }

    // Test 3: Gửi email chào mừng
    console.log("📨 Test 3: Gửi email chào mừng...");
    const result3 = await sendWelcomeEmail(
      testEmail,
      "Nguyễn Test User",
      "TempPassword123!"
    );

    if (result3.success) {
      console.log("✅ Test 3 PASSED: Email chào mừng đã được gửi thành công!");
      console.log(`   Message ID: ${result3.messageId}\n`);
    }

    console.log("═══════════════════════════════════════════════");
    console.log("✅ TẤT CẢ TESTS PASSED!");
    console.log("═══════════════════════════════════════════════");
    console.log(`\n📬 Vui lòng kiểm tra inbox của email: ${testEmail}`);
    console.log("💡 Tip: Nếu không thấy email, kiểm tra thư mục Spam/Junk\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error("Lỗi:", error.message);
    console.error("\n🔧 Khắc phục:");
    console.error("1. Kiểm tra MAIL_USER và MAIL_PASS trong config.env");
    console.error(
      "2. Đảm bảo MAIL_PASS là App Password (16 ký tự, không có khoảng trắng)"
    );
    console.error("3. Kiểm tra kết nối internet");
    console.error("4. Xem file EMAIL_SETUP_GUIDE.md để biết chi tiết\n");

    if (error.message.includes("Invalid login")) {
      console.error("⚠️  Lỗi đăng nhập Gmail:");
      console.error("   - Đảm bảo đã bật 2FA cho tài khoản Gmail");
      console.error("   - Tạo App Password mới và cập nhật vào config.env");
      console.error("   - Không sử dụng mật khẩu thường của Gmail\n");
    }

    process.exit(1);
  }
}

// Chạy test
testEmailService();
