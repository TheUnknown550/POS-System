const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const BranchController = require('../controllers/branchController');

// Company routes
router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);
router.post('/', CompanyController.createCompany);
router.put('/:id', CompanyController.updateCompany);
router.delete('/:id', CompanyController.deleteCompany);

// Company admin routes
router.post('/:id/admins', CompanyController.addCompanyAdmin);

// Company branches routes
router.get('/:companyId/branches', BranchController.getBranchesByCompany);

module.exports = router;
