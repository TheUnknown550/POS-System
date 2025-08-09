const { Branch, Company, BranchStaff, BranchTable, Order, User } = require('../models');

class BranchController {
  // GET /api/branches
  static async getAllBranches(req, res) {
    try {
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

      const branches = await Branch.findAll({
        where: { company_id: userCompanyId },
        include: [
          {
            model: Company,
            as: 'company'
          },
          {
            model: BranchTable,
            as: 'tables'
          },
          {
            model: BranchStaff,
            as: 'staff',
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
        data: branches,
        count: branches.length
      });
    } catch (error) {
      console.error('Error fetching branches:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch branches',
        message: error.message
      });
    }
  }

  // GET /api/branches/:id
  static async getBranchById(req, res) {
    try {
      const { id } = req.params;
      const branch = await Branch.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company'
          },
          {
            model: BranchTable,
            as: 'tables'
          },
          {
            model: BranchStaff,
            as: 'staff',
            include: [{
              model: User,
              as: 'user',
              attributes: { exclude: ['password_hash'] }
            }]
          }
        ]
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Branch not found'
        });
      }

      res.json({
        success: true,
        data: branch
      });
    } catch (error) {
      console.error('Error fetching branch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch branch',
        message: error.message
      });
    }
  }

  // GET /api/companies/:companyId/branches
  static async getBranchesByCompany(req, res) {
    try {
      const { companyId } = req.params;
      
      const branches = await Branch.findAll({
        where: { company_id: companyId },
        include: [
          {
            model: BranchTable,
            as: 'tables'
          },
          {
            model: BranchStaff,
            as: 'staff',
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
        data: branches,
        count: branches.length
      });
    } catch (error) {
      console.error('Error fetching company branches:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company branches',
        message: error.message
      });
    }
  }

  // POST /api/branches
  static async createBranch(req, res) {
    try {
      const { company_id, name, address } = req.body;

      if (!company_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'Company ID and branch name are required'
        });
      }

      // Check if company exists
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      const branch = await Branch.create({
        company_id,
        name,
        address
      });

      res.status(201).json({
        success: true,
        data: branch,
        message: 'Branch created successfully'
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create branch',
        message: error.message
      });
    }
  }

  // PUT /api/branches/:id
  static async updateBranch(req, res) {
    try {
      const { id } = req.params;
      const { name, address } = req.body;

      const branch = await Branch.findByPk(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Branch not found'
        });
      }

      await branch.update({ name, address });

      res.json({
        success: true,
        data: branch,
        message: 'Branch updated successfully'
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update branch',
        message: error.message
      });
    }
  }

  // DELETE /api/branches/:id
  static async deleteBranch(req, res) {
    try {
      const { id } = req.params;

      const branch = await Branch.findByPk(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Branch not found'
        });
      }

      await branch.destroy();

      res.json({
        success: true,
        message: 'Branch deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete branch',
        message: error.message
      });
    }
  }

  // POST /api/branches/:id/staff
  static async addBranchStaff(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.body;

      if (!user_id || !role) {
        return res.status(400).json({
          success: false,
          error: 'User ID and role are required'
        });
      }

      // Check if branch exists
      const branch = await Branch.findByPk(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Branch not found'
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

      // Check if user is already staff of this branch
      const existingStaff = await BranchStaff.findOne({
        where: { branch_id: id, user_id }
      });

      if (existingStaff) {
        return res.status(409).json({
          success: false,
          error: 'User is already staff of this branch'
        });
      }

      const branchStaff = await BranchStaff.create({
        branch_id: id,
        user_id,
        role
      });

      res.status(201).json({
        success: true,
        data: branchStaff,
        message: 'Branch staff added successfully'
      });
    } catch (error) {
      console.error('Error adding branch staff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add branch staff',
        message: error.message
      });
    }
  }
}

module.exports = BranchController;
