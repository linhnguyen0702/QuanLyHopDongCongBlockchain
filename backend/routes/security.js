const express = require('express');
const router = express.Router();
const SecuritySettings = require('../models/SecuritySettings');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// @route   GET /api/security/settings
// @desc    Get security settings
// @access  Private (Admin only)
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await SecuritySettings.getCurrentSettings();
    res.json({
      status: 'success',
      data: { settings }
    });
  } catch (error) {
    console.error('Get security settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch security settings'
    });
  }
});

// @route   PUT /api/security/settings
// @desc    Update security settings
// @access  Private (Admin only)
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await SecuritySettings.updateSettings(req.body, req.user._id);
    res.json({
      status: 'success',
      message: 'Security settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update security settings'
    });
  }
});

// @route   POST /api/security/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long'
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    });
  }
});

// @route   GET /api/security/alerts
// @desc    Get security alerts
// @access  Private (Admin only)
router.get('/alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock security alerts - in real app, these would come from monitoring systems
    const alerts = [
      {
        id: 1,
        type: 'warning',
        message: 'Hệ thống phát hiện đăng nhập từ IP lạ: 192.168.1.100',
        timestamp: new Date(),
        severity: 'medium'
      },
      {
        id: 2,
        type: 'info',
        message: 'Bản sao lưu dữ liệu đã được tạo thành công lúc 02:00 sáng nay',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'low'
      },
      {
        id: 3,
        type: 'success',
        message: 'Tất cả các chứng chỉ SSL đều hợp lệ',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: 'low'
      }
    ];

    res.json({
      status: 'success',
      data: { alerts }
    });
  } catch (error) {
    console.error('Get security alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch security alerts'
    });
  }
});

// @route   GET /api/security/activities
// @desc    Get recent security activities
// @access  Private (Admin only)
router.get('/activities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    
    const activities = await AuditLog.find({
      type: 'security',
      action: { $in: ['login', 'logout', 'password_change', 'failed_login'] }
    })
    .populate('performedBy', 'username fullName')
    .sort({ performedAt: -1 })
    .limit(10);

    res.json({
      status: 'success',
      data: { activities }
    });
  } catch (error) {
    console.error('Get security activities error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch security activities'
    });
  }
});

module.exports = router;
