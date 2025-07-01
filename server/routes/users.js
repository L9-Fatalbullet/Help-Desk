const express = require('express');
const { body, validationResult, query } = require('express-validator');
const {
  getUsers,
  findUserById,
  addUser,
  updateUser,
  deleteUser
} = require('../models/User');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    let users = getUsers(req.app);
    // Filters
    if (req.query.role) users = users.filter(u => u.role === req.query.role);
    if (req.query.isActive) users = users.filter(u => String(u.isActive) === String(req.query.isActive));
    if (req.query.location) users = users.filter(u => u.gasStationLocation && u.gasStationLocation.toLowerCase().includes(req.query.location.toLowerCase()));
    users = users.map(u => {
      const { password, ...userData } = u;
      return userData;
    });
    res.json({
      users: Array.isArray(users) ? users : [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: users.length,
        itemsPerPage: users.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private (Admin)
router.get('/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const user = findUserById(req.app, req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  authorizeAdmin,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'help-desk', 'gas-station']),
  body('isActive').optional().isBoolean(),
  body('gasStationLocation').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const updateData = req.body;
    const user = updateUser(req.app, req.params.id, updateData);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const user = findUserById(req.app, req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    deleteUser(req.app, req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 