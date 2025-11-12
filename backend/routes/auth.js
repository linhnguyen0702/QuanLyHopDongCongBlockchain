const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { validate, schemas } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const AuditLog = require("../models/AuditLog");
const SecuritySettings = require("../models/SecuritySettings");
const { sendOTP } = require("../services/emailService");

const router = express.Router();

// Configure multer for avatar upload
const uploadDir = path.join(__dirname, "../uploads/avatars/");
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (in production, should be admin only)
router.post("/register", validate(schemas.register), async (req, res) => {
  try {
    const { username, email, password, fullName, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
      role,
      department,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: user.profile,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if 2FA is enabled
    const securitySettings = await SecuritySettings.getCurrentSettings();
    if (securitySettings.twoFactorAuth) {
      // Generate and save OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otpCode = otpCode;
      user.otpCodeExpires = otpCodeExpires;
      await user.save();

      // Gửi OTP qua email (không chờ để tránh block UI)
      // Log OTP ra console ngay để có thể test
      console.log(`🔑 [OTP] OTP for ${user.email}: ${otpCode}`);

      // Gửi email trong background (không await)
      sendOTP(user.email, otpCode, user.fullName || user.username)
        .then(() => {
          console.log(`✅ [2FA] OTP email sent successfully to ${user.email}`);
        })
        .catch((emailError) => {
          console.error("❌ Error sending OTP email:", emailError.message);
        });

      // Respond ngay lập tức (không chờ email)
      return res.json({
        status: "2fa_required",
        message:
          "Xác thực 2 yếu tố được yêu cầu. Vui lòng kiểm tra email để lấy mã OTP.",
        data: {
          userId: user._id,
        },
      });
    } else {
      // Proceed with normal login
      await user.updateLastLogin();
      const token = generateToken(user._id);

      await AuditLog.createLog({
        type: "security",
        action: "login",
        description: `Người dùng ${user.username} đã đăng nhập thành công.`,
        performedBy: user._id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.json({
        status: "success",
        message: "Login successful",
        data: {
          user: user.profile,
          token,
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      status: "success",
      data: {
        user: req.user.profile,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get user profile",
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile (with latest data from DB)
// @access  Private
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // Fetch user from DB to get latest data including phone, position
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        user: user.profile,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get user profile",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  validate(schemas.updateProfile),
  async (req, res) => {
    try {
      const allowedUpdates = [
        "username",
        "email",
        "fullName",
        "phone",
        "department",
        "position",
        "walletAddress",
      ];
      const updates = {};

      // Only allow certain fields to be updated
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Check if email or username already exists (excluding current user)
      if (updates.email || updates.username) {
        const orConditions = [];
        if (updates.email) {
          orConditions.push({ email: updates.email });
        }
        if (updates.username) {
          orConditions.push({ username: updates.username });
        }

        if (orConditions.length > 0) {
          const existingUser = await User.findOne({
            $or: orConditions,
            _id: { $ne: req.user._id },
          });

          if (existingUser) {
            return res.status(400).json({
              status: "error",
              message: "Email or username already exists",
            });
          }
        }
      }

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      console.log("Updated user:", user.toObject());

      res.json({
        status: "success",
        message: "Profile updated successfully",
        data: {
          user: user.profile,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update profile",
      });
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "New password must be at least 6 characters long",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
    });
  }
});

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post(
  "/upload-avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      // Store relative path for frontend access
      const relativePath = path
        .join("uploads", "avatars", req.file.filename)
        .replace(/\\/g, "/");

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: relativePath },
        { new: true }
      );

      res.json({
        status: "success",
        message: "Avatar uploaded successfully",
        data: {
          user: user.profile,
          avatar: relativePath,
        },
      });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to upload avatar",
      });
    }
  }
);

// @route   GET /api/auth/activity-log
// @desc    Get user activity log
// @access  Private
router.get("/activity-log", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const AuditLog = require("../models/AuditLog");

    const activities = await AuditLog.find({
      performedBy: req.user._id,
    })
      .populate("performedBy", "username fullName")
      .sort({ performedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments({
      performedBy: req.user._id,
    });

    res.json({
      status: "success",
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get activity log error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch activity log",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    await AuditLog.createLog({
      type: "security",
      action: "logout",
      description: `Người dùng ${req.user.username} đã đăng xuất.`,
      performedBy: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Logout audit log error:", error);
  }

  res.json({
    status: "success",
    message: "Logout successful",
  });
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for 2FA login
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
      return res.status(400).json({
        status: "error",
        message: "User ID and OTP code are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.otpCode !== otpCode || new Date() > user.otpCodeExpires) {
      await AuditLog.createLog({
        type: "security",
        action: "failed_login",
        description: `Người dùng ${user.username} đã nhập sai mã OTP.`,
        performedBy: user._id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return res.status(401).json({
        status: "error",
        message: "Mã OTP không hợp lệ hoặc đã hết hạn.",
      });
    }

    // Clear OTP fields
    user.otpCode = undefined;
    user.otpCodeExpires = undefined;
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    // Create audit log for successful login
    await AuditLog.createLog({
      type: "security",
      action: "login",
      description: `Người dùng ${user.username} đã đăng nhập thành công (2FA).`,
      performedBy: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: user.profile,
        token,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify OTP",
    });
  }
});

module.exports = router;
