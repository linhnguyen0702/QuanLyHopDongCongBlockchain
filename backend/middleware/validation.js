const Joi = require("joi");

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.log("❌ Validation error:", error.details);
      console.log("📋 Request body:", req.body);
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
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
    role: Joi.string().valid("admin", "manager", "user").default("user"),
    department: Joi.string().max(100).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid("admin", "manager", "user").default("user"),
    department: Joi.string().max(100).optional(),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .optional(),
    position: Joi.string().max(100).optional(),
  }),

  updateUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    fullName: Joi.string().min(2).max(100).optional(),
    role: Joi.string().valid("admin", "manager", "user").optional(),
    department: Joi.string().max(100).optional(),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .optional(),
    position: Joi.string().max(100).optional(),
    isActive: Joi.boolean().optional(),
  }),

  // Contract schemas
  createContract: Joi.object({
    contractNumber: Joi.string().required().messages({
      "string.empty": "Số hợp đồng là bắt buộc",
      "any.required": "Số hợp đồng là bắt buộc",
    }),
    contractName: Joi.string().min(5).max(200).required().messages({
      "string.empty": "Tên hợp đồng là bắt buộc",
      "string.min": "Tên hợp đồng phải có ít nhất 5 ký tự",
      "string.max": "Tên hợp đồng không được vượt quá 200 ký tự",
      "any.required": "Tên hợp đồng là bắt buộc",
    }),
    contractor: Joi.string().min(2).max(200).required().messages({
      "string.empty": "Nhà thầu là bắt buộc",
      "string.min": "Tên nhà thầu phải có ít nhất 2 ký tự",
      "string.max": "Tên nhà thầu không được vượt quá 200 ký tự",
      "any.required": "Nhà thầu là bắt buộc",
    }),
    contractValue: Joi.number().positive().required().messages({
      "number.base": "Giá trị hợp đồng phải là số",
      "number.positive": "Giá trị hợp đồng phải lớn hơn 0",
      "any.required": "Giá trị hợp đồng là bắt buộc",
    }),
    currency: Joi.string().valid("VND", "USD", "EUR").default("VND").messages({
      "any.only": "Loại tiền tệ không hợp lệ (VND, USD, EUR)",
    }),
    startDate: Joi.date().required().messages({
      "date.base": "Ngày bắt đầu không hợp lệ",
      "any.required": "Ngày bắt đầu là bắt buộc",
    }),
    endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
      "date.base": "Ngày kết thúc không hợp lệ",
      "date.greater": "Ngày kết thúc phải sau ngày bắt đầu",
      "any.required": "Ngày kết thúc là bắt buộc",
    }),
    description: Joi.string().max(1000).optional().messages({
      "string.max": "Mô tả không được vượt quá 1000 ký tự",
    }),
    contractType: Joi.string()
      .valid("construction", "supply", "service", "consulting")
      .required()
      .messages({
        "any.only": "Loại hợp đồng không hợp lệ",
        "any.required": "Loại hợp đồng là bắt buộc",
      }),
    status: Joi.string()
      .valid("draft", "pending", "approved", "active", "completed", "cancelled")
      .default("draft")
      .messages({
        "any.only": "Trạng thái không hợp lệ",
      }),
    department: Joi.string().max(100).required().messages({
      "string.empty": "Phòng ban là bắt buộc",
      "string.max": "Tên phòng ban không được vượt quá 100 ký tự",
      "any.required": "Phòng ban là bắt buộc",
    }),
    responsiblePerson: Joi.string().max(100).required().messages({
      "string.empty": "Người phụ trách là bắt buộc",
      "string.max": "Tên người phụ trách không được vượt quá 100 ký tự",
      "any.required": "Người phụ trách là bắt buộc",
    }),
    attachments: Joi.array().items(Joi.string()).optional(),
    blockchain: Joi.object({
      transactionHash: Joi.string().optional(),
      blockNumber: Joi.number().optional(),
      contractAddress: Joi.string().optional(),
    }).optional(),
  }),

  updateContract: Joi.object({
    contractName: Joi.string().min(5).max(200).optional().messages({
      "string.min": "Tên hợp đồng phải có ít nhất 5 ký tự",
      "string.max": "Tên hợp đồng không được vượt quá 200 ký tự",
    }),
    contractor: Joi.string().min(2).max(200).optional().messages({
      "string.min": "Tên nhà thầu phải có ít nhất 2 ký tự",
      "string.max": "Tên nhà thầu không được vượt quá 200 ký tự",
    }),
    contractValue: Joi.number().positive().optional().messages({
      "number.base": "Giá trị hợp đồng phải là số",
      "number.positive": "Giá trị hợp đồng phải lớn hơn 0",
    }),
    currency: Joi.string().valid("VND", "USD", "EUR").optional().messages({
      "any.only": "Loại tiền tệ không hợp lệ (VND, USD, EUR)",
    }),
    startDate: Joi.date().optional().messages({
      "date.base": "Ngày bắt đầu không hợp lệ",
    }),
    endDate: Joi.date().optional().messages({
      "date.base": "Ngày kết thúc không hợp lệ",
    }),
    description: Joi.string().max(1000).optional().messages({
      "string.max": "Mô tả không được vượt quá 1000 ký tự",
    }),
    contractType: Joi.string()
      .valid("construction", "supply", "service", "consulting")
      .optional()
      .messages({
        "any.only": "Loại hợp đồng không hợp lệ",
      }),
    status: Joi.string()
      .valid("draft", "pending", "approved", "active", "completed", "cancelled")
      .optional()
      .messages({
        "any.only": "Trạng thái không hợp lệ",
      }),
    department: Joi.string().max(100).optional().messages({
      "string.max": "Tên phòng ban không được vượt quá 100 ký tự",
    }),
    responsiblePerson: Joi.string().max(100).optional().messages({
      "string.max": "Tên người phụ trách không được vượt quá 100 ký tự",
    }),
    attachments: Joi.array().items(Joi.string()).optional(),
    blockchain: Joi.object({
      transactionHash: Joi.string().optional(),
      blockNumber: Joi.number().optional(),
      contractAddress: Joi.string().optional(),
    }).optional(),
  }),

  // Contractor schemas
  createContractor: Joi.object({
    contractorCode: Joi.string().uppercase().required(),
    contractorName: Joi.string().min(2).max(200).required(),
    contactPerson: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .required(),
    address: Joi.string().min(5).max(500).required(),
    taxCode: Joi.string()
      .pattern(/^[0-9]{10,13}$/)
      .required(),
    businessLicense: Joi.string().max(50).optional(),
    contractorType: Joi.string()
      .valid("construction", "supply", "service", "consulting", "other")
      .required(),
    status: Joi.string()
      .valid("active", "inactive", "suspended", "blacklisted")
      .default("active"),
    rating: Joi.number().min(1).max(5).default(3),
    description: Joi.string().max(1000).optional(),
  }),

  updateContractor: Joi.object({
    contractorCode: Joi.string().uppercase().optional(),
    contractorName: Joi.string().min(2).max(200).optional(),
    contactPerson: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .optional(),
    address: Joi.string().min(5).max(500).optional(),
    taxCode: Joi.string()
      .pattern(/^[0-9]{10,13}$/)
      .optional(),
    businessLicense: Joi.string().max(50).optional(),
    contractorType: Joi.string()
      .valid("construction", "supply", "service", "consulting", "other")
      .optional(),
    status: Joi.string()
      .valid("active", "inactive", "suspended", "blacklisted")
      .optional(),
    rating: Joi.number().min(1).max(5).optional(),
    description: Joi.string().max(1000).optional(),
  }),

  // Profile schemas
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .optional(),
    department: Joi.string().max(100).optional(),
    position: Joi.string().max(100).optional(),
    walletAddress: Joi.string()
      .pattern(/^0x[a-fA-F0-9]{40}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base":
          "Địa chỉ ví Ethereum không hợp lệ (phải bắt đầu bằng 0x và có 40 ký tự hex)",
      }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),

  // Query schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
    contractType: Joi.string().optional(),
    department: Joi.string().optional(),
  }),
};

module.exports = {
  validate,
  schemas,
};
