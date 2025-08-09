const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branchController');
const TableController = require('../controllers/tableController');
const OrderController = require('../controllers/orderController');
const StaffController = require('../controllers/staffController');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Branch routes (protected)
router.get('/', authenticateToken, BranchController.getAllBranches);
router.get('/:id', authenticateToken, BranchController.getBranchById);
router.post('/', authenticateToken, BranchController.createBranch);
router.put('/:id', authenticateToken, BranchController.updateBranch);
router.delete('/:id', authenticateToken, BranchController.deleteBranch);

// Branch staff routes
router.post('/:id/staff', authenticateToken, BranchController.addBranchStaff);
router.get('/:branchId/staff', authenticateToken, StaffController.getStaffByBranch);

// Branch tables routes
router.get('/:branchId/tables', authenticateToken, TableController.getTablesByBranch);

// Branch orders routes
router.get('/:branchId/orders', authenticateToken, OrderController.getOrdersByBranch);

module.exports = router;
