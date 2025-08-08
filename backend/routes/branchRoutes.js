const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branchController');
const TableController = require('../controllers/tableController');
const OrderController = require('../controllers/orderController');

// Branch routes
router.get('/', BranchController.getAllBranches);
router.get('/:id', BranchController.getBranchById);
router.post('/', BranchController.createBranch);
router.put('/:id', BranchController.updateBranch);
router.delete('/:id', BranchController.deleteBranch);

// Branch staff routes
router.post('/:id/staff', BranchController.addBranchStaff);

// Branch tables routes
router.get('/:branchId/tables', TableController.getTablesByBranch);

// Branch orders routes
router.get('/:branchId/orders', OrderController.getOrdersByBranch);

module.exports = router;
