const express = require('express');
const { getNotifications, findNotificationById, updateNotification } = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    let notifications = getNotifications(req.app).filter(n => n.recipient === req.user.id);
    notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = findNotificationById(req.app, req.params.id);
    if (!notification || notification.recipient !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    updateNotification(req.app, notification.id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = findNotificationById(req.app, req.params.id);
    if (!notification || notification.recipient !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    req.app.locals.notifications = req.app.locals.notifications.filter(n => n.id !== notification.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 