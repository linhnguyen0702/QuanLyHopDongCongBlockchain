const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['contract', 'user', 'contractor', 'security', 'system'],
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'approved', 'rejected', 'activated', 'suspended', 'login', 'logout', 'viewed', 'password_change', 'backup', 'failed_login'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  resourceType: {
    type: String
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes for better performance
auditLogSchema.index({ type: 1, action: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ performedAt: -1 });
auditLogSchema.index({ resourceId: 1, resourceType: 1 });

// Static method to create audit log
auditLogSchema.statics.createLog = async function(data) {
  const log = new this(data);
  await log.save();
  return log;
};

// Static method to get audit logs with filters
auditLogSchema.statics.getLogs = async function(filters = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    action,
    startDate,
    endDate,
    performedBy
  } = filters;

  const query = {};

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }

  if (type) query.type = type;
  if (action) query.action = action;
  if (performedBy) query.performedBy = performedBy;

  if (startDate || endDate) {
    query.performedAt = {};
    if (startDate) query.performedAt.$gte = new Date(startDate);
    if (endDate) query.performedAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const logs = await this.find(query)
    .populate('performedBy', 'username fullName email')
    .sort({ performedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await this.countDocuments(query);

  return {
    logs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
