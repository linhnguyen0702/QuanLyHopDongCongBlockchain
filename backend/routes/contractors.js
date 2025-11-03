const express = require('express');
const Contractor = require('../models/Contractor');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireManager } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// @route   GET /api/contractors
// @desc    Get all contractors with pagination and filters
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      contractorType
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { contractorName: { $regex: search, $options: 'i' } },
        { contractorCode: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { taxCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (contractorType) filter.contractorType = contractorType;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const contractors = await Contractor.find(filter)
      .populate('createdBy', 'username fullName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contractor.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        contractors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contractors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contractors'
    });
  }
});

// @route   GET /api/contractors/:id
// @desc    Get contractor by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id)
      .populate('createdBy', 'username fullName email')
      .populate('history.performedBy', 'username fullName');

    if (!contractor) {
      return res.status(404).json({
        status: 'error',
        message: 'Contractor not found'
      });
    }

    res.json({
      status: 'success',
      data: { contractor }
    });
  } catch (error) {
    console.error('Get contractor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contractor'
    });
  }
});

// @route   POST /api/contractors
// @desc    Create new contractor
// @access  Private (Manager/Admin only)
router.post('/', authenticateToken, requireManager, validate(schemas.createContractor), async (req, res) => {
  try {
    // Normalize contractor code to uppercase (consistent with model)
    const contractorCode = req.body.contractorCode.toUpperCase();
    
    // Check if contractor code already exists
    const existingContractor = await Contractor.findOne({ 
      contractorCode 
    });

    if (existingContractor) {
      return res.status(400).json({
        status: 'error',
        message: 'Contractor code already exists'
      });
    }

    // Check if tax code already exists
    const existingTaxCode = await Contractor.findOne({ 
      taxCode: req.body.taxCode 
    });

    if (existingTaxCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Tax code already exists'
      });
    }

    const contractor = new Contractor({
      ...req.body,
      contractorCode,
      createdBy: req.user._id
    });

    await AuditLog.createLog({
      type: 'contractor',
      action: 'created',
      description: `Nhà thầu "${contractor.contractorName}" đã được tạo.`,
      performedBy: req.user._id,
      resourceId: contractor._id,
      resourceType: 'Contractor'
    });

    await contractor.save();

    res.status(201).json({
      status: 'success',
      message: 'Contractor created successfully',
      data: { contractor }
    });
  } catch (error) {
    console.error('Create contractor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create contractor'
    });
  }
});

// @route   PUT /api/contractors/:id
// @desc    Update contractor
// @access  Private (Manager/Admin only)
router.put('/:id', authenticateToken, requireManager, validate(schemas.updateContractor), async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        status: 'error',
        message: 'Contractor not found'
      });
    }

    // Check if contractor code already exists (excluding current contractor)
    if (req.body.contractorCode) {
      // Normalize to uppercase
      const contractorCode = req.body.contractorCode.toUpperCase();
      
      const existingContractor = await Contractor.findOne({
        contractorCode,
        _id: { $ne: req.params.id }
      });

      if (existingContractor) {
        return res.status(400).json({
          status: 'error',
          message: 'Contractor code already exists'
        });
      }
      
      // Update the request body with normalized code
      req.body.contractorCode = contractorCode;
    }

    // Check if tax code already exists (excluding current contractor)
    if (req.body.taxCode) {
      const existingTaxCode = await Contractor.findOne({
        taxCode: req.body.taxCode,
        _id: { $ne: req.params.id }
      });

      if (existingTaxCode) {
        return res.status(400).json({
          status: 'error',
          message: 'Tax code already exists'
        });
      }
    }

    // Apply updates
    Object.assign(contractor, req.body);

    await AuditLog.createLog({
      type: 'contractor',
      action: 'updated',
      description: `Nhà thầu "${contractor.contractorName}" đã được cập nhật.`,
      performedBy: req.user._id,
      resourceId: contractor._id,
      resourceType: 'Contractor'
    });

    const updatedContractor = await contractor.save();
    await updatedContractor.populate('createdBy', 'username fullName');

    res.json({
      status: 'success',
      message: 'Contractor updated successfully',
      data: { contractor: updatedContractor }
    });
  } catch (error) {
    console.error('Update contractor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update contractor'
    });
  }
});

// @route   DELETE /api/contractors/:id
// @desc    Delete contractor (soft delete)
// @access  Private (Manager/Admin only)
router.delete('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        status: 'error',
        message: 'Contractor not found'
      });
    }

    // Soft delete by setting status to inactive
    contractor.status = 'inactive';
    await AuditLog.createLog({
      type: 'contractor',
      action: 'deactivated',
      description: `Nhà thầu "${contractor.contractorName}" đã bị vô hiệu hóa.`,
      performedBy: req.user._id,
      resourceId: contractor._id,
      resourceType: 'Contractor'
    });
    await contractor.save();

    res.json({
      status: 'success',
      message: 'Contractor deactivated successfully'
    });
  } catch (error) {
    console.error('Delete contractor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete contractor'
    });
  }
});

// @route   POST /api/contractors/:id/activate
// @desc    Activate contractor
// @access  Private (Manager/Admin only)
router.post('/:id/activate', authenticateToken, requireManager, async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        status: 'error',
        message: 'Contractor not found'
      });
    }

    contractor.status = 'active';
    await AuditLog.createLog({
      type: 'contractor',
      action: 'activated',
      description: `Nhà thầu "${contractor.contractorName}" đã được kích hoạt.`,
      performedBy: req.user._id,
      resourceId: contractor._id,
      resourceType: 'Contractor'
    });
    await contractor.save();

    res.json({
      status: 'success',
      message: 'Contractor activated successfully',
      data: { contractor }
    });
  } catch (error) {
    console.error('Activate contractor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to activate contractor'
    });
  }
});

// @route   POST /api/contractors/:id/suspend
// @desc    Suspend contractor
// @access  Private (Manager/Admin only)
router.post('/:id/suspend', authenticateToken, requireManager, async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        status: 'error',
        message: 'Contractor not found'
      });
    }

    contractor.status = 'suspended';
    await AuditLog.createLog({
      type: 'contractor',
      action: 'suspended',
      description: `Nhà thầu "${contractor.contractorName}" đã bị tạm dừng.`,
      performedBy: req.user._id,
      resourceId: contractor._id,
      resourceType: 'Contractor'
    });
    await contractor.save();

    res.json({
      status: 'success',
      message: 'Contractor suspended successfully',
      data: { contractor }
    });
  } catch (error) {
    console.error('Suspend contractor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to suspend contractor'
    });
  }
});

// @route   GET /api/contractors/stats/overview
// @desc    Get contractor statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Contractor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Contractor.aggregate([
      {
        $group: {
          _id: '$contractorType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContractors = await Contractor.countDocuments();
    const activeContractors = await Contractor.countDocuments({ status: 'active' });

    const recentContractors = await Contractor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('contractorName contractorCode contractorType status createdAt')
      .populate('createdBy', 'username fullName');

    res.json({
      status: 'success',
      data: {
        totalContractors,
        activeContractors,
        statusBreakdown: stats,
        typeBreakdown: typeStats,
        recentContractors
      }
    });
  } catch (error) {
    console.error('Get contractor stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contractor statistics'
    });
  }
});

module.exports = router;
