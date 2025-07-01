const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { authorizeAdmin, authorizeHelpDesk } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin/help-desk only)
// @access  Private
router.get('/', authorizeHelpDesk, [
  query('role').optional().isIn(['admin', 'help-desk', 'gas-station']),
  query('isActive').optional().isBoolean(),
  query('location').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      role,
      isActive,
      location,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (location) filter.gasStationLocation = new RegExp(location, 'i');

    // Pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', authorizeHelpDesk, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private
router.put('/:id', [
  authorizeAdmin,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'help-desk', 'gas-station']),
  body('gasStationLocation').optional().trim(),
  body('phone').optional().trim(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      role,
      gasStationLocation,
      phone,
      isActive
    } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (gasStationLocation) updateData.gasStationLocation = gasStationLocation;
    if (phone) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/:id', authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/stats/overview', authorizeAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          admin: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          helpDesk: { $sum: { $cond: [{ $eq: ['$role', 'help-desk'] }, 1, 0] } },
          gasStation: { $sum: { $cond: [{ $eq: ['$role', 'gas-station'] }, 1, 0] } }
        }
      }
    ]);

    // Get users by location
    const locationStats = await User.aggregate([
      {
        $match: { role: 'gas-station' }
      },
      {
        $group: {
          _id: '$gasStationLocation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        admin: 0,
        helpDesk: 0,
        gasStation: 0
      },
      locationStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 