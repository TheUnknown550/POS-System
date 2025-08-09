const express = require('express');
const router = express.Router();
const TableController = require('../controllers/tableController');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Table routes (protected)
router.get('/', authenticateToken, TableController.getAllTables);
router.get('/:id', authenticateToken, TableController.getTableById);
router.post('/', authenticateToken, TableController.createTable);
router.put('/:id', authenticateToken, TableController.updateTable);
router.put('/:id/status', authenticateToken, TableController.updateTableStatus);
router.delete('/:id', authenticateToken, TableController.deleteTable);

module.exports = router;
