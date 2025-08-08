const express = require('express');
const router = express.Router();
const TableController = require('../controllers/tableController');

// Table routes
router.get('/', TableController.getAllTables);
router.get('/:id', TableController.getTableById);
router.post('/', TableController.createTable);
router.put('/:id', TableController.updateTable);
router.put('/:id/status', TableController.updateTableStatus);
router.delete('/:id', TableController.deleteTable);

module.exports = router;
