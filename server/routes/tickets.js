const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authorizeHelpDesk, authorizeGasStation } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|log/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, document, and log files are allowed'));
    }
  }
});

// Helper function to create notifications
const createNotification = async (recipientId, title, message, type, relatedTicket = null) => {
  try {
    await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      relatedTicket
    });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

// @route   POST /api/tickets
// @desc    Create a new ticket
// @access  Private
router.post('/', [
  upload.array('attachments', 5),
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty(),
  body('priority').isIn(['low', 'medium', 'high', 'critical']),
  body('category').optional().isIn(['hardware', 'software', 'network', 'payment', 'fuel-system', 'other']),
  body('gasStationLocation').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      priority,
      category,
      gasStationLocation,
      customerContact
    } = req.body;

    // Prepare attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    // Create ticket
    const ticket = new Ticket({
      title,
      description,
      priority,
      category,
      gasStationLocation,
      reportedBy: req.user._id,
      attachments,
      customerContact: customerContact ? JSON.parse(customerContact) : undefined
    });

    await ticket.save();

    // Populate user info
    await ticket.populate('reportedBy', 'firstName lastName email');

    // Create notification for help desk agents
    const helpDeskUsers = await User.find({ 
      role: { $in: ['admin', 'help-desk'] },
      isActive: true 
    });

    for (const user of helpDeskUsers) {
      await createNotification(
        user._id,
        'New Ticket Created',
        `New ${priority} priority ticket: ${title}`,
        'ticket_created',
        ticket._id
      );
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('ticket-created', { ticket });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets
// @desc    Get tickets with filters
// @access  Private
router.get('/', [
  query('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('category').optional().isIn(['hardware', 'software', 'network', 'payment', 'fuel-system', 'other']),
  query('location').optional().trim(),
  query('assignedTo').optional().isMongoId(),
  query('reportedBy').optional().isMongoId(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      status,
      priority,
      category,
      location,
      assignedTo,
      reportedBy,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (location) filter.gasStationLocation = new RegExp(location, 'i');
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reportedBy) filter.reportedBy = reportedBy;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Role-based filtering
    if (req.user.role === 'gas-station') {
      filter.reportedBy = req.user._id;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get tickets with pagination
    const tickets = await Ticket.find(filter)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/:id
// @desc    Get single ticket
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access permissions
    if (req.user.role === 'gas-station' && ticket.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tickets/:id
// @desc    Update ticket
// @access  Private
router.put('/:id', [
  authorizeHelpDesk,
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('assignedTo').optional().isMongoId(),
  body('estimatedResolutionTime').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const {
      status,
      priority,
      assignedTo,
      estimatedResolutionTime
    } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (estimatedResolutionTime) updateData.estimatedResolutionTime = estimatedResolutionTime;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('reportedBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email');

    // Create notifications for status changes
    if (status && status !== ticket.status) {
      await createNotification(
        ticket.reportedBy,
        'Ticket Status Updated',
        `Your ticket "${ticket.title}" status changed to ${status}`,
        'status_change',
        ticket._id
      );
    }

    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        await createNotification(
          assignedTo,
          'Ticket Assigned',
          `You have been assigned ticket: ${ticket.title}`,
          'ticket_assigned',
          ticket._id
        );
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ticket-${ticket._id}`).emit('ticket-updated', { ticket: updatedTicket });

    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tickets/:id/comments
// @desc    Add comment to ticket
// @access  Private
router.post('/:id/comments', [
  body('content').trim().notEmpty(),
  body('isInternal').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { content, isInternal = false } = req.body;

    // Add comment
    await ticket.addComment(req.user._id, content, isInternal);

    // Populate the new comment
    await ticket.populate('comments.user', 'firstName lastName role');

    // Create notification for ticket owner (if comment is not internal)
    if (!isInternal && ticket.reportedBy.toString() !== req.user._id.toString()) {
      await createNotification(
        ticket.reportedBy,
        'New Comment on Ticket',
        `New comment on ticket: ${ticket.title}`,
        'comment_added',
        ticket._id
      );
    }

    // Create notification for assigned agent (if different from commenter)
    if (ticket.assignedTo && ticket.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification(
        ticket.assignedTo,
        'New Comment on Assigned Ticket',
        `New comment on your assigned ticket: ${ticket.title}`,
        'comment_added',
        ticket._id
      );
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ticket-${ticket._id}`).emit('comment-added', { 
      ticket,
      comment: ticket.comments[ticket.comments.length - 1]
    });

    res.json(ticket);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/stats/overview
// @desc    Get ticket statistics
// @access  Private (Help Desk)
router.get('/stats/overview', authorizeHelpDesk, async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);

    // Get tickets by location
    const locationStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$gasStationLocation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get average resolution time
    const resolutionTimeStats = await Ticket.aggregate([
      {
        $match: {
          actualResolutionTime: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: { $subtract: ['$actualResolutionTime', '$createdAt'] } }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        critical: 0,
        high: 0
      },
      locationStats,
      avgResolutionTime: resolutionTimeStats[0]?.avgResolutionTime || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 