const express = require('express');
const Contract = require('../models/Contract');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireManager } = require('../middleware/auth');


const router = express.Router();

// @route   GET /api/contracts
// @desc    Get all contracts with pagination and filtering
// @access  Private
router.get('/', authenticateToken, validate(schemas.pagination), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      contractType,
      department
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { contractNumber: { $regex: search, $options: 'i' } },
        { contractName: { $regex: search, $options: 'i' } },
        { contractor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (contractType) filter.contractType = contractType;
    if (department) filter.department = department;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const contracts = await Contract.find(filter)
      .populate('createdBy', 'username fullName email')
      .populate('approvedBy', 'username fullName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contract.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        contracts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách hợp đồng'
    });
  }
});

// @route   GET /api/contracts/:id
// @desc    Get contract by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('createdBy', 'username fullName email')
      .populate('approvedBy', 'username fullName email')
      .populate('history.performedBy', 'username fullName email');

    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hợp đồng'
      });
    }

    res.json({
      status: 'success',
      data: { contract }
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải thông tin hợp đồng'
    });
  }
});

// @route   POST /api/contracts
// @desc    Create new contract
// @access  Private
router.post('/', authenticateToken, validate(schemas.createContract), async (req, res) => {
  try {
    const contractData = {
      ...req.body,
      createdBy: req.user._id
    };

    const contract = new Contract(contractData);
    await contract.save();



    await contract.populate('createdBy', 'username fullName email');

    res.status(201).json({
      status: 'success',
      message: 'Tạo hợp đồng thành công',
      data: { contract }
    });
  } catch (error) {
    console.error('Lỗi khi tạo hợp đồng:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Số hợp đồng đã tồn tại'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Không thể tạo hợp đồng'
    });
  }
});

// @route   PUT /api/contracts/:id
// @desc    Update contract
// @access  Private
router.put('/:id', authenticateToken, validate(schemas.updateContract), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hợp đồng'
      });
    }

    // Check permissions
    if (contract.createdBy.toString() !== req.user._id.toString() && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Không được phép cập nhật hợp đồng này'
      });
    }

    let updateData = { ...req.body };

    // If contract is approved or active, only allow non-critical fields to be updated.
    if (contract.status === 'approved' || contract.status === 'active') {
      const allowedUpdates = {
        contractName: req.body.contractName,
        description: req.body.description,
        department: req.body.department,
        responsiblePerson: req.body.responsiblePerson,
        // Add any other fields that are safe to update here
      };
      updateData = allowedUpdates;
    }

    // Find the contract first
    const contractToUpdate = await Contract.findById(req.params.id);

    // Apply the updates to the document
    Object.assign(contractToUpdate, updateData);

    // Save the document, which will run validators correctly
    const savedContract = await contractToUpdate.save();

    const updatedContract = await savedContract.populate([
      { path: 'createdBy', select: 'username fullName email' },
      { path: 'approvedBy', select: 'username fullName email' },
    ]);



    res.json({
      status: 'success',
      message: 'Cập nhật hợp đồng thành công',
      data: { contract: updatedContract }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật hợp đồng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật hợp đồng'
    });
  }
});

// @route   POST /api/contracts/:id/approve
// @desc    Approve contract
// @access  Private (Manager/Admin only)
router.post('/:id/approve', authenticateToken, requireManager, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hợp đồng'
      });
    }

    if (contract.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Chỉ có hợp đồng chờ phê duyệt mới được phê duyệt'
      });
    }

    contract.status = 'approved';
    contract.approvedBy = req.user._id;
    contract.approvedAt = new Date();
    
    contract.history.push({
      action: 'approved',
      performedBy: req.user._id,
      comment: req.body.comment || 'Hợp đồng đã được phê duyệt'
    });

    await contract.save();



    await contract.populate('approvedBy', 'username fullName email');

    res.json({
      status: 'success',
      message: 'Hợp đồng đã được phê duyệt thành công',
      data: { contract }
    });
  } catch (error) {
    console.error('Lỗi khi phê duyệt hợp đồng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể phê duyệt hợp đồng'
    });
  }
});

// @route   POST /api/contracts/:id/reject
// @desc    Reject contract
// @access  Private (Manager/Admin only)
router.post('/:id/reject', authenticateToken, requireManager, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hợp đồng'
      });
    }

    if (contract.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Chỉ có hợp đồng chờ phê duyệt mới được từ chối'
      });
    }

    contract.status = 'rejected';
    contract.rejectedBy = req.user._id;
    contract.rejectedAt = new Date();
    
    contract.history.push({
      action: 'rejected',
      performedBy: req.user._id,
      comment: req.body.comment || 'Hợp đồng đã được từ chối'
    });

    await contract.save();



    await contract.populate('rejectedBy', 'username fullName email');

    res.json({
      status: 'success',
      message: 'Hợp đồng đã được từ chối thành công',
      data: { contract }
    });
  } catch (error) {
    console.error('Lỗi khi từ chối hợp đồng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể từ chối hợp đồng'
    });
  }
});

// @route   POST /api/contracts/:id/activate
// @desc    Activate contract
// @access  Private (Manager/Admin only)
router.post('/:id/activate', authenticateToken, requireManager, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hợp đồng'
      });
    }

    if (contract.status !== 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Chỉ có hợp đồng đã được phê duyệt mới được kích hoạt'
      });
    }

    contract.status = 'active';
    contract.history.push({
      action: 'activated',
      performedBy: req.user._id,
      comment: req.body.comment || 'Hợp đồng đã được kích hoạt'
    });

    await contract.save();



    res.json({
      status: 'success',
      message: 'Hợp đồng đã được kích hoạt thành công',
      data: { contract }
    });
  } catch (error) {
    console.error('Lỗi khi kích hoạt hợp đồng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể kích hoạt hợp đồng'
    });
  }
});

// @route   DELETE /api/contracts/:id
// @desc    Delete contract
// @access  Private (Admin only or contract creator)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hợp đồng'
      });
    }

    // Check permissions
    if (contract.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Không được phép xóa hợp đồng này'
      });
    }

    // Don't allow deleting approved/active contracts
    if (['approved', 'active', 'completed'].includes(contract.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa hợp đồng đã được phê duyệt/đang hoạt động/đã hoàn thành'
      });
    }

    await Contract.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Hợp đồng đã được xóa thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa hợp đồng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể xóa hợp đồng'
    });
  }
});

// @route   GET /api/contracts/stats/overview
// @desc    Get contract statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Contract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$contractValue' }
        }
      }
    ]);

    const totalContracts = await Contract.countDocuments();
    const totalValue = await Contract.aggregate([
      { $group: { _id: null, total: { $sum: '$contractValue' } } }
    ]);

    const expiringContracts = await Contract.findExpiring(30);

    res.json({
      status: 'success',
      data: {
        totalContracts,
        totalValue: totalValue[0]?.total || 0,
        statusBreakdown: stats,
        expiringContracts: expiringContracts.length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải thống kê hợp đồng'
    });
  }
});

module.exports = router;
