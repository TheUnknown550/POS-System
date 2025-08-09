const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const BranchController = require('../controllers/branchController');

// Import authentication middleware from authRoutes
const { authenticateToken } = require('./authRoutes');

// Company routes (protected)
router.get('/', authenticateToken, CompanyController.getAllCompanies);
router.get('/:id', authenticateToken, CompanyController.getCompanyById);
router.post('/', authenticateToken, CompanyController.createCompany);
router.put('/:id', authenticateToken, CompanyController.updateCompany);
router.delete('/:id', authenticateToken, CompanyController.deleteCompany);

// Company admin routes
router.post('/:id/admins', authenticateToken, CompanyController.addCompanyAdmin);

// Company branches routes
router.get('/:companyId/branches', authenticateToken, BranchController.getBranchesByCompany);

module.exports = router;
