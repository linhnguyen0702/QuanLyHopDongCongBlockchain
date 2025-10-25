const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireManager } = require('../middleware/auth');

// @route   GET /api/audit
// @desc    Get audit logs with filters
// @access  Private (Manager/Admin only)
router.get('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      action,
      startDate,
      endDate,
      performedBy
    } = req.query;

    const result = await AuditLog.getLogs({
      page,
      limit,
      search,
      type,
      action,
      startDate,
      endDate,
      performedBy
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch audit logs'
    });
  }
});

// @route   GET /api/audit/stats
// @desc    Get audit statistics
// @access  Private (Manager/Admin only)
router.get('/stats', authenticateToken, requireManager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) query.performedAt.$gte = new Date(startDate);
      if (endDate) query.performedAt.$lte = new Date(endDate);
    }

    const totalLogs = await AuditLog.countDocuments(query);

    const typeStats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const actionStats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const userStats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$performedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userName: '$user.fullName',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      status: 'success',
      data: {
        totalLogs,
        typeStats,
        actionStats,
        userStats
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch audit statistics'
    });
  }
});

module.exports = router;
