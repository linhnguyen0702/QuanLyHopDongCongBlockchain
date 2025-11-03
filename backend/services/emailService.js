let nodemailer;
let transporter;
let isEmailServiceAvailable = false;

// Kiểm tra xem nodemailer đã được cài đặt chưa
try {
  nodemailer = require("nodemailer");

  // Cấu hình transporter
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // App password từ Gmail
    },
    pool: true, // Use pooled connections
    maxConnections: 1,
    maxMessages: 100,
    rateDelta: 1000, // 1 second
    rateLimit: 5, // 5 emails per rateDelta
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 5000,
    socketTimeout: 15000,
  });

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ Email service configuration error:", error.message);
      isEmailServiceAvailable = false;
    } else {
      console.log("✅ Email service is ready to send messages");
      isEmailServiceAvailable = true;
    }
  });
} catch (error) {
  console.warn("⚠️  Nodemailer not installed. Email service disabled.");
  console.warn("   Run: npm install nodemailer");
  isEmailServiceAvailable = false;
}

/**
 * Gửi OTP qua email
 * @param {string} email - Email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 * @param {string} userName - Tên người dùng (optional)
 */
async function sendOTP(email, otp, userName = "Người dùng") {
  // Kiểm tra xem email service có sẵn không
  if (!isEmailServiceAvailable || !transporter) {
    console.warn(`⚠️  Email service not available. OTP not sent to ${email}`);
    return {
      success: false,
      error: "Email service not configured. Please install nodemailer.",
    };
  }

  try {
    const mailOptions = {
      from: `"Hệ thống Quản lý Hợp đồng" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Mã xác thực OTP - Đăng nhập hệ thống",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #1976d2;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .otp-box {
              background-color: #f0f7ff;
              border: 2px solid #1976d2;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 5px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #1976d2;
              letter-spacing: 5px;
              margin: 10px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Xác thực đăng nhập</h2>
            </div>
            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              <p>Bạn đã yêu cầu đăng nhập vào hệ thống Quản lý Hợp đồng Công. Đây là mã OTP của bạn:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Mã xác thực OTP</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">Vui lòng nhập mã này để hoàn tất đăng nhập</p>
              </div>

              <div class="warning">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Mã OTP này sẽ <strong>hết hạn sau 10 phút</strong></li>
                  <li>Không chia sẻ mã này với bất kỳ ai</li>
                  <li>Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này</li>
                </ul>
              </div>

              <p style="margin-top: 20px;">Nếu bạn gặp vấn đề, vui lòng liên hệ quản trị viên hệ thống.</p>
              
              <p style="margin-top: 30px;">Trân trọng,<br><strong>Hệ thống Quản lý Hợp đồng Công</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${new Date().getFullYear()} Hệ thống Quản lý Hợp đồng Công. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Sử dụng Promise.race để thêm timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Email timeout after 15 seconds")),
        15000
      )
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log("✅ OTP email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    // Không throw error để không block luồng chính
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email thông báo chung
 * @param {string} email - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung HTML
 */
async function sendEmail(email, subject, htmlContent) {
  if (!isEmailServiceAvailable || !transporter) {
    console.warn(`⚠️  Email service not available. Email not sent to ${email}`);
    return { success: false, error: "Email service not configured" };
  }

  try {
    const mailOptions = {
      from: `"Hệ thống Quản lý Hợp đồng" <${process.env.MAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
  }
}

/**
 * Gửi email chào mừng người dùng mới
 */
async function sendWelcomeEmail(email, userName, temporaryPassword) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .credentials { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #1976d2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Chào mừng đến với Hệ thống Quản lý Hợp đồng</h2>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>
          
          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mật khẩu tạm thời:</strong> ${temporaryPassword}</p>
          </div>

          <p><strong>⚠️ Quan trọng:</strong> Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên.</p>
          
          <p style="margin-top: 30px;">Trân trọng,<br><strong>Ban quản trị</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(
    email,
    "Chào mừng đến với Hệ thống Quản lý Hợp đồng",
    htmlContent
  );
}

module.exports = {
  sendOTP,
  sendEmail,
  sendWelcomeEmail,
};
