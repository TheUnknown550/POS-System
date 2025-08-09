const { Company, CompanyAdmin, Branch, User } = require('../models');

class CompanyController {
  // GET /api/companies
  static async getAllCompanies(req, res) {
    try {
      const userId = req.user.id;
      const userCompanyId = req.user.companyId;

      // If user doesn't have a company, return empty results
      if (!userCompanyId) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No company associated with user'
        });
      }

      const companies = await Company.findAll({
        where: { id: userCompanyId },
        include: [
          {
            model: Branch,
            as: 'branches'
          },
          {
            model: CompanyAdmin,
            as: 'admins',
            include: [{
              model: User,
              as: 'user',
              attributes: { exclude: ['password_hash'] }
            }]
          }
        ]
      });

      res.json({
        success: true,
        data: companies,
        count: companies.length
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch companies',
        message: error.message
      });
    }
  }

  // GET /api/companies/:id
  static async getCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await Company.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branches'
          },
          {
            model: CompanyAdmin,
            as: 'admins',
            include: [{
              model: User,
              as: 'user',
              attributes: { exclude: ['password_hash'] }
            }]
          }
        ]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company',
        message: error.message
      });
    }
  }

  // POST /api/companies
  static async createCompany(req, res) {
    try {
      const { name, address, phone, email } = req.body;
      const userId = req.user.id;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Company name is required'
        });
      }

      // Check if user already has a company
      const existingAdmin = await CompanyAdmin.findOne({
        where: { user_id: userId }
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          error: 'User already belongs to a company'
        });
      }

      const company = await Company.create({ 
        name,
        address: address || '',
        phone: phone || '',
        email: email || req.user.email
      });

      // Make the user a company admin
      await CompanyAdmin.create({
        user_id: userId,
        company_id: company.id,
        role: 'admin' // Set default role as admin for company creator
      });

      res.status(201).json({
        success: true,
        data: company,
        message: 'Company created successfully. Please log out and log back in to access company features.',
        requiresReauth: true
      });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create company',
        message: error.message
      });
    }
  }

  // PUT /api/companies/:id
  static async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      await company.update({ name });

      res.json({
        success: true,
        data: company,
        message: 'Company updated successfully'
      });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update company',
        message: error.message
      });
    }
  }

  // DELETE /api/companies/:id
  static async deleteCompany(req, res) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      await company.destroy();

      res.json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete company',
        message: error.message
      });
    }
  }

  // POST /api/companies/:id/admins
  static async addCompanyAdmin(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.body;

      if (!user_id || !role) {
        return res.status(400).json({
          success: false,
          error: 'User ID and role are required'
        });
      }

      // Check if company exists
      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      // Check if user exists
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is already an admin of this company
      const existingAdmin = await CompanyAdmin.findOne({
        where: { company_id: id, user_id }
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          error: 'User is already an admin of this company'
        });
      }

      const companyAdmin = await CompanyAdmin.create({
        company_id: id,
        user_id,
        role
      });

      res.status(201).json({
        success: true,
        data: companyAdmin,
        message: 'Company admin added successfully'
      });
    } catch (error) {
      console.error('Error adding company admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add company admin',
        message: error.message
      });
    }
  }
}

module.exports = CompanyController;
