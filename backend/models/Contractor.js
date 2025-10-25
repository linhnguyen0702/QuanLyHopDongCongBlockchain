const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
  contractorCode: {
    type: String,
    required: [true, 'Contractor code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  contractorName: {
    type: String,
    required: [true, 'Contractor name is required'],
    trim: true,
    maxlength: [200, 'Contractor name cannot exceed 200 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  taxCode: {
    type: String,
    required: [true, 'Tax code is required'],
    trim: true,
    unique: true,
    match: [/^[0-9]{10,13}$/, 'Tax code must be 10-13 digits']
  },
  businessLicense: {
    type: String,
    trim: true,
    maxlength: [50, 'Business license cannot exceed 50 characters']
  },
  contractorType: {
    type: String,
    enum: ['construction', 'supply', 'service', 'consulting', 'other'],
    required: [true, 'Contractor type is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'blacklisted'],
    default: 'active'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'activated', 'deactivated', 'suspended', 'blacklisted']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    changes: mongoose.Schema.Types.Mixed,
    comment: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contractorSchema.index({ contractorCode: 1 });
contractorSchema.index({ contractorName: 1 });
contractorSchema.index({ email: 1 });
contractorSchema.index({ taxCode: 1 });
contractorSchema.index({ status: 1 });
contractorSchema.index({ contractorType: 1 });
contractorSchema.index({ createdBy: 1 });
contractorSchema.index({ createdAt: -1 });

// Virtual for formatted contractor info
contractorSchema.virtual('formattedInfo').get(function() {
  return `${this.contractorName} (${this.contractorCode})`;
});

// Pre-save middleware to add history entry
contractorSchema.pre('save', function(next) {
  if (this.isNew) {
    this.history.push({
      action: 'created',
      performedBy: this.createdBy,
      comment: 'Contractor created'
    });
  } else if (this.isModified()) {
    const changes = {};
    const modifiedFields = this.modifiedPaths();
    
    modifiedFields.forEach(field => {
      if (field !== 'history' && field !== 'updatedAt') {
        changes[field] = {
          from: this.get(field, null, { getters: false }),
          to: this.get(field)
        };
      }
    });
    
    this.history.push({
      action: 'updated',
      performedBy: this.createdBy,
      changes: changes,
      comment: 'Contractor updated'
    });
  }
  
  next();
});

// Static method to find contractors by status
contractorSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find contractors by type
contractorSchema.statics.findByType = function(type) {
  return this.find({ contractorType: type });
};

// Static method to find active contractors
contractorSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

module.exports = mongoose.model('Contractor', contractorSchema);
