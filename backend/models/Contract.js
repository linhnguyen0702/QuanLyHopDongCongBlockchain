const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: [true, "Contract number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    contractName: {
      type: String,
      required: [true, "Contract name is required"],
      trim: true,
      maxlength: [200, "Contract name cannot exceed 200 characters"],
    },
    contractor: {
      type: String,
      required: [true, "Contractor is required"],
      trim: true,
      maxlength: [200, "Contractor name cannot exceed 200 characters"],
    },
    contractValue: {
      type: Number,
      required: [true, "Contract value is required"],
      min: [0, "Contract value cannot be negative"],
    },
    currency: {
      type: String,
      enum: ["VND", "USD", "EUR"],
      default: "VND",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    contractType: {
      type: String,
      enum: ["construction", "supply", "service", "consulting"],
      required: [true, "Contract type is required"],
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "active",
        "completed",
        "cancelled",
        "deleted", // Added deleted status for soft delete
      ],
      default: "draft",
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    responsiblePerson: {
      type: String,
      required: [true, "Responsible person is required"],
      trim: true,
      maxlength: [100, "Responsible person name cannot exceed 100 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // New approval system: requires 2 approvals
    approvals: [
      {
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        approvedAt: {
          type: Date,
          default: Date.now,
        },
        comment: String,
      },
    ],
    // Keep for backward compatibility
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    version: {
      type: Number,
      default: 1,
    },
    // Blockchain integration fields
    blockchain: {
      enabled: {
        type: Boolean,
        default: false,
      },
      transactionHash: {
        type: String,
        trim: true,
      },
      blockNumber: {
        type: Number,
      },
      contractAddress: {
        type: String,
        trim: true,
      },
      network: {
        type: String,
        enum: ["localhost", "sepolia", "mainnet"],
        default: "sepolia",
      },
      createdOnChain: {
        type: Date,
      },
      lastSyncedAt: {
        type: Date,
      },
    },
    history: [
      {
        action: {
          type: String,
          enum: [
            "created",
            "updated",
            "approved",
            "rejected",
            "activated",
            "completed",
            "cancelled",
            "deleted",
          ],
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        changes: mongoose.Schema.Types.Mixed,
        comment: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
contractSchema.index({ contractNumber: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ contractType: 1 });
contractSchema.index({ department: 1 });
contractSchema.index({ createdBy: 1 });
contractSchema.index({ startDate: 1, endDate: 1 });
contractSchema.index({ createdAt: -1 });

// Virtual for contract duration in days
contractSchema.virtual("duration").get(function () {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for contract progress
contractSchema.virtual("progress").get(function () {
  if (this.status === "completed") return 100;
  if (this.status === "cancelled") return 0;

  const now = new Date();
  if (now < this.startDate) return 0;
  if (now > this.endDate) return 100;

  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  return Math.round((elapsed / totalDuration) * 100);
});

// Virtual for formatted contract value
contractSchema.virtual("formattedValue").get(function () {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: this.currency === "VND" ? "VND" : this.currency,
  });
  return formatter.format(this.contractValue);
});

// Static method to find contracts by status
contractSchema.statics.findByStatus = function (status) {
  return this.find({ status });
};

// Static method to find contracts by department
contractSchema.statics.findByDepartment = function (department) {
  return this.find({ department });
};

// Static method to find active contracts
contractSchema.statics.findActive = function () {
  return this.find({
    status: { $in: ["approved", "active"] },
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });
};

// Static method to find expiring contracts
contractSchema.statics.findExpiring = function (days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: { $in: ["approved", "active"] },
    endDate: { $lte: futureDate, $gte: new Date() },
  });
};

module.exports = mongoose.model("Contract", contractSchema);
