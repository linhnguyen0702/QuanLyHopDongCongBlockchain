const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get system settings
// @access  Private (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await SystemSettings.getCurrentSettings();
    res.json({
      status: 'success',
      data: { settings }
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system settings'
    });
  }
});

// @route   PUT /api/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await SystemSettings.updateSettings(req.body, req.user._id);
    res.json({
      status: 'success',
      message: 'System settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update system settings'
    });
  }
});

// @route   GET /api/settings/system-info
// @desc    Get system information
// @access  Private (Admin only)
router.get('/system-info', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const systemInfo = await SystemSettings.getSystemInfo();
    res.json({
      status: 'success',
      data: { systemInfo }
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system information'
    });
  }
});

// @route   POST /api/settings/backup
// @desc    Create manual backup
// @access  Private (Admin only)
router.post('/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock backup creation - in real app, this would create actual backup
    const backupId = `backup_${Date.now()}`;
    
    res.json({
      status: 'success',
      message: 'Backup created successfully',
      data: { backupId }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create backup'
    });
  }
});

// @route   POST /api/settings/check-updates
// @desc    Check for system updates
// @access  Private (Admin only)
router.post('/check-updates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock update check - in real app, this would check for actual updates
    const updates = {
      available: false,
      currentVersion: 'v1.0.0',
      latestVersion: 'v1.0.0',
      updateNotes: 'No updates available'
    };
    
    res.json({
      status: 'success',
      data: { updates }
    });
  } catch (error) {
    console.error('Check updates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check for updates'
    });
  }
});

// @route   POST /api/settings/clear-cache
// @desc    Clear system cache
// @access  Private (Admin only)
router.post('/clear-cache', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock cache clearing - in real app, this would clear actual cache
    res.json({
      status: 'success',
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache'
    });
  }
});

module.exports = router;
