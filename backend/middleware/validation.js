const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Schemas cho validation
const schemas = {
  // User schemas
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user'),
    department: Joi.string().max(100).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user'),
    department: Joi.string().max(100).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    position: Joi.string().max(100).optional()
  }),

  updateUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    fullName: Joi.string().min(2).max(100).optional(),
    role: Joi.string().valid('admin', 'manager', 'user').optional(),
    department: Joi.string().max(100).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    position: Joi.string().max(100).optional(),
    isActive: Joi.boolean().optional()
  }),

  // Contract schemas
  createContract: Joi.object({
    contractNumber: Joi.string().required(),
    contractName: Joi.string().min(5).max(200).required(),
    contractor: Joi.string().min(2).max(200).required(),
    contractValue: Joi.number().positive().required(),
    currency: Joi.string().valid('VND', 'USD', 'EUR').default('VND'),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    description: Joi.string().max(1000).optional(),
    contractType: Joi.string().valid('construction', 'supply', 'service', 'consulting').required(),
    status: Joi.string().valid('draft', 'pending', 'approved', 'active', 'completed', 'cancelled').default('draft'),
    department: Joi.string().max(100).required(),
    responsiblePerson: Joi.string().max(100).required(),
    attachments: Joi.array().items(Joi.string()).optional()
  }),

  updateContract: Joi.object({
    contractName: Joi.string().min(5).max(200).optional(),
    contractor: Joi.string().min(2).max(200).optional(),
    contractValue: Joi.number().positive().optional(),
    currency: Joi.string().valid('VND', 'USD', 'EUR').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    description: Joi.string().max(1000).optional(),
    contractType: Joi.string().valid('construction', 'supply', 'service', 'consulting').optional(),
    status: Joi.string().valid('draft', 'pending', 'approved', 'active', 'completed', 'cancelled').optional(),
    department: Joi.string().max(100).optional(),
    responsiblePerson: Joi.string().max(100).optional(),
    attachments: Joi.array().items(Joi.string()).optional()
  }),

  // Contractor schemas
  createContractor: Joi.object({
    contractorCode: Joi.string().uppercase().required(),
    contractorName: Joi.string().min(2).max(200).required(),
    contactPerson: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required(),
    address: Joi.string().min(5).max(500).required(),
    taxCode: Joi.string().pattern(/^[0-9]{10,13}$/).required(),
    businessLicense: Joi.string().max(50).optional(),
    contractorType: Joi.string().valid('construction', 'supply', 'service', 'consulting', 'other').required(),
    status: Joi.string().valid('active', 'inactive', 'suspended', 'blacklisted').default('active'),
    rating: Joi.number().min(1).max(5).default(3),
    description: Joi.string().max(1000).optional()
  }),

  updateContractor: Joi.object({
    contractorCode: Joi.string().uppercase().optional(),
    contractorName: Joi.string().min(2).max(200).optional(),
    contactPerson: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    address: Joi.string().min(5).max(500).optional(),
    taxCode: Joi.string().pattern(/^[0-9]{10,13}$/).optional(),
    businessLicense: Joi.string().max(50).optional(),
    contractorType: Joi.string().valid('construction', 'supply', 'service', 'consulting', 'other').optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended', 'blacklisted').optional(),
    rating: Joi.number().min(1).max(5).optional(),
    description: Joi.string().max(1000).optional()
  }),

  // Profile schemas
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    department: Joi.string().max(100).optional(),
    position: Joi.string().max(100).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  // Query schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
    contractType: Joi.string().optional(),
    department: Joi.string().optional()
  })
};

module.exports = {
  validate,
  schemas
};
