const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['ticket_created', 'ticket_updated', 'ticket_assigned', 'comment_added', 'status_change', 'system'],
    default: 'system'
  },
  relatedTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark email as sent
notificationSchema.methods.markEmailSent = function() {
  this.isEmailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({ recipient: userId, isRead: false })
    .populate('relatedTicket', 'title status priority')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Notification', notificationSchema); 