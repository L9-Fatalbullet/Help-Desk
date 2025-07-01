const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const {
  getTickets,
  findTicketById,
  addTicket,
  updateTicket,
  addComment
} = require('../models/Ticket');
const { getUsers, findUserById } = require('../models/User');
const { getNotifications, addNotification } = require('../models/Notification');
const { authorizeHelpDesk } = require('../middleware/auth');

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
const createNotification = (app, recipientId, title, message, type, relatedTicket = null) => {
  addNotification(app, {
    recipient: recipientId,
    title,
    message,
    type,
    relatedTicket
  });
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
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];
    const ticket = addTicket(req.app, {
      title,
      description,
      priority,
      category,
      gasStationLocation,
      reportedBy: req.user.id,
      attachments,
      customerContact: customerContact ? JSON.parse(customerContact) : undefined,
      status: 'open'
    });
    // Notify help desk
    getUsers(req.app).filter(u => ['admin', 'help-desk'].includes(u.role) && u.isActive)
      .forEach(user => {
        createNotification(req.app, user.id, 'New Ticket Created', `New ${priority} priority ticket: ${title}`, 'ticket_created', ticket.id);
      });
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
  query('assignedTo').optional(),
  query('reportedBy').optional(),
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
    let tickets = getTickets(req.app);
    if (status) tickets = tickets.filter(t => t.status === status);
    if (priority) tickets = tickets.filter(t => t.priority === priority);
    if (category) tickets = tickets.filter(t => t.category === category);
    if (location) tickets = tickets.filter(t => t.gasStationLocation && t.gasStationLocation.toLowerCase().includes(location.toLowerCase()));
    if (assignedTo) tickets = tickets.filter(t => t.assignedTo === assignedTo);
    if (reportedBy) tickets = tickets.filter(t => t.reportedBy === reportedBy);
    if (dateFrom) tickets = tickets.filter(t => new Date(t.createdAt) >= new Date(dateFrom));
    if (dateTo) tickets = tickets.filter(t => new Date(t.createdAt) <= new Date(dateTo));
    if (req.user.role === 'gas-station') {
      tickets = tickets.filter(t => t.reportedBy === req.user.id);
    }
    tickets = tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // Pagination
    const skip = (page - 1) * limit;
    const paged = tickets.slice(skip, skip + parseInt(limit));
    res.json({
      tickets: paged,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(tickets.length / limit),
        totalItems: tickets.length,
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
    const ticket = findTicketById(req.app, req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role === 'gas-station' && ticket.reportedBy !== req.user.id) {
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
  body('assignedTo').optional(),
  body('estimatedResolutionTime').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = findTicketById(req.app, req.params.id);
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
    const updatedTicket = updateTicket(req.app, req.params.id, updateData);
    // Notifications
    if (status && status !== ticket.status) {
      createNotification(req.app, ticket.reportedBy, 'Ticket Status Updated', `Your ticket "${ticket.title}" status changed to ${status}`, 'status_change', ticket.id);
    }
    if (assignedTo && assignedTo !== ticket.assignedTo) {
      createNotification(req.app, assignedTo, 'Ticket Assigned', `You have been assigned ticket: ${ticket.title}`, 'ticket_assigned', ticket.id);
    }
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ticket-${ticket.id}`).emit('ticket-updated', { ticket: updatedTicket });
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
    const ticket = findTicketById(req.app, req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const { content, isInternal = false } = req.body;
    addComment(req.app, ticket.id, {
      user: req.user.id,
      content,
      isInternal
    });
    // Notifications
    if (!isInternal && ticket.reportedBy !== req.user.id) {
      createNotification(req.app, ticket.reportedBy, 'New Comment on Ticket', `New comment on ticket: ${ticket.title}`, 'comment_added', ticket.id);
    }
    if (ticket.assignedTo && ticket.assignedTo !== req.user.id) {
      createNotification(req.app, ticket.assignedTo, 'New Comment on Assigned Ticket', `New comment on your assigned ticket: ${ticket.title}`, 'comment_added', ticket.id);
    }
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ticket-${ticket.id}`).emit('comment-added', { 
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
    const tickets = getTickets(req.app);
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      critical: tickets.filter(t => t.priority === 'critical').length,
      high: tickets.filter(t => t.priority === 'high').length
    };
    // Tickets by location
    const locationStats = Object.entries(
      tickets.reduce((acc, t) => {
        acc[t.gasStationLocation] = (acc[t.gasStationLocation] || 0) + 1;
        return acc;
      }, {})
    ).map(([location, count]) => ({ _id: location, count }))
     .sort((a, b) => b.count - a.count)
     .slice(0, 10);
    // Average resolution time
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' && t.createdAt && t.updatedAt);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => sum + (new Date(t.updatedAt) - new Date(t.createdAt)), 0) / resolvedTickets.length
      : 0;
    res.json({
      overview: stats,
      locationStats,
      avgResolutionTime
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 