const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Staff routes (protected)
router.get('/', authenticateToken, StaffController.getAllStaff);
router.get('/:id', authenticateToken, StaffController.getStaffById);
router.post('/', authenticateToken, StaffController.createStaff);
router.put('/:id', authenticateToken, StaffController.updateStaff);
router.delete('/:id', authenticateToken, StaffController.deleteStaff);

module.exports = router;
