const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isInternal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['hardware', 'software', 'network', 'payment', 'fuel-system', 'other'],
    default: 'other'
  },
  gasStationLocation: {
    type: String,
    required: true,
    trim: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  comments: [commentSchema],
  estimatedResolutionTime: {
    type: Date
  },
  actualResolutionTime: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  escalationLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  customerContact: {
    name: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ gasStationLocation: 1 });
ticketSchema.index({ reportedBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ createdAt: -1 });

// Virtual for resolution time
ticketSchema.virtual('resolutionTime').get(function() {
  if (this.actualResolutionTime && this.createdAt) {
    return this.actualResolutionTime - this.createdAt;
  }
  return null;
});

// Method to update status
ticketSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'resolved') {
    this.actualResolutionTime = new Date();
  }
  return this.save();
};

// Method to add comment
ticketSchema.methods.addComment = function(userId, content, isInternal = false) {
  this.comments.push({
    user: userId,
    content,
    isInternal
  });
  return this.save();
};

// Pre-save middleware to set urgent flag based on priority
ticketSchema.pre('save', function(next) {
  if (this.priority === 'critical' || this.priority === 'high') {
    this.isUrgent = true;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema); 