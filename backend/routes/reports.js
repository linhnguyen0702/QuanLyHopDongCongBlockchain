const express = require('express');
const Contract = require('../models/Contract');
const User = require('../models/User');
const { authenticateToken, requireManager } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/contracts/summary
// @desc    Get contract summary report
// @access  Private (Manager/Admin only)
router.get('/contracts/summary', authenticateToken, requireManager, async (req, res) => {
  try {
    const { startDate, endDate, department, contractType } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (department) filter.department = department;
    if (contractType) filter.contractType = contractType;

    // Get contract statistics
    const contractStats = await Contract.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$contractValue' },
          avgValue: { $avg: '$contractValue' }
        }
      }
    ]);

    // Get total statistics
    const totalStats = await Contract.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalContracts: { $sum: 1 },
          totalValue: { $sum: '$contractValue' },
          avgValue: { $avg: '$contractValue' }
        }
      }
    ]);

    // Get contracts by type
    const typeStats = await Contract.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$contractType',
          count: { $sum: 1 },
          totalValue: { $sum: '$contractValue' }
        }
      }
    ]);

    // Get contracts by department
    const deptStats = await Contract.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalValue: { $sum: '$contractValue' }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      status: 'success',
      data: {
        summary: totalStats[0] || { totalContracts: 0, totalValue: 0, avgValue: 0 },
        statusBreakdown: contractStats,
        typeBreakdown: typeStats,
        departmentBreakdown: deptStats
      }
    });
  } catch (error) {
    console.error('Get contract summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate contract summary report'
    });
  }
});

// @route   GET /api/reports/contracts/trends
// @desc    Get contract trends over time
// @access  Private (Manager/Admin only)
router.get('/contracts/trends', authenticateToken, requireManager, async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Build date filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (period) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
        break;
      case 'year':
        groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default: // month
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const trends = await Contract.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          totalValue: { $sum: '$contractValue' },
          avgValue: { $avg: '$contractValue' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        period,
        trends
      }
    });
  } catch (error) {
    console.error('Get contract trends error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate contract trends report'
    });
  }
});

// @route   GET /api/reports/contracts/expiring
// @desc    Get expiring contracts report
// @access  Private (Manager/Admin only)
router.get('/contracts/expiring', authenticateToken, requireManager, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringContracts = await Contract.find({
      status: { $in: ['approved', 'active'] },
      endDate: { $lte: futureDate, $gte: new Date() }
    })
    .populate('createdBy', 'username fullName email')
    .populate('approvedBy', 'username fullName email')
    .sort({ endDate: 1 });

    // Group by days until expiration
    const groupedContracts = expiringContracts.reduce((acc, contract) => {
      const daysUntilExpiry = Math.ceil((contract.endDate - new Date()) / (1000 * 60 * 60 * 24));
      const key = daysUntilExpiry <= 7 ? 'critical' : 
                  daysUntilExpiry <= 15 ? 'warning' : 'normal';
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(contract);
      return acc;
    }, {});

    res.json({
      status: 'success',
      data: {
        totalExpiring: expiringContracts.length,
        daysThreshold: parseInt(days),
        contracts: groupedContracts,
        allContracts: expiringContracts
      }
    });
  } catch (error) {
    console.error('Get expiring contracts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate expiring contracts report'
    });
  }
});

// @route   GET /api/reports/users/activity
// @desc    Get user activity report
// @access  Private (Admin only)
router.get('/users/activity', authenticateToken, requireManager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.lastLogin = {};
      if (startDate) filter.lastLogin.$gte = new Date(startDate);
      if (endDate) filter.lastLogin.$lte = new Date(endDate);
    }

    const activeUsers = await User.find({
      ...filter,
      isActive: true,
      lastLogin: { $exists: true }
    })
    .select('username fullName email role department lastLogin')
    .sort({ lastLogin: -1 });

    const inactiveUsers = await User.find({
      isActive: true,
      $or: [
        { lastLogin: { $exists: false } },
        { lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 days ago
      ]
    })
    .select('username fullName email role department lastLogin');

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$lastLogin', null] },
                  { $gte: ['$lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        activeUsers,
        inactiveUsers,
        userStats,
        totalActive: activeUsers.length,
        totalInactive: inactiveUsers.length
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate user activity report'
    });
  }
});

// @route   GET /api/reports/dashboard
// @desc    Get dashboard summary data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get basic statistics
    const totalContracts = await Contract.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // Get unique contractors count
    const contractorStats = await Contract.aggregate([
      {
        $group: {
          _id: '$contractor',
          count: { $sum: 1 }
        }
      }
    ]);
    const totalContractors = contractorStats.length;
    
    // Get contract value statistics
    const valueStats = await Contract.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$contractValue' },
          avgValue: { $avg: '$contractValue' }
        }
      }
    ]);

    // Calculate performance (percentage of completed contracts)
    const performanceStats = await Contract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalCompleted = performanceStats.find(stat => stat._id === 'completed')?.count || 0;
    const performance = totalContracts > 0 ? Math.round((totalCompleted / totalContracts) * 100) : 0;

    // Get recent contracts
    const recentContracts = await Contract.find()
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('contractNumber contractName contractor contractValue status createdAt');

    // Get expiring contracts (next 30 days)
    const expiringContracts = await Contract.findExpiring(30);

    // Get status breakdown
    const statusBreakdown = await Contract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        totalContracts,
        totalUsers,
        totalContractors,
        totalValue: valueStats[0]?.totalValue || 0,
        avgValue: valueStats[0]?.avgValue || 0,
        performance,
        recentContracts,
        expiringContracts: expiringContracts.length,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;
