const { BranchStaff, Branch, User } = require('../models');

class StaffController {
  // GET /api/staff
  static async getAllStaff(req, res) {
    try {
      const { branch_id, role, status } = req.query;
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

      let whereClause = {};

      if (branch_id) {
        whereClause.branch_id = branch_id;
      }
      if (role) {
        whereClause.role = role;
      }
      if (status) {
        whereClause.status = status;
      }

      const staff = await BranchStaff.findAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch',
            where: { company_id: userCompanyId }
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password_hash'] }
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: staff,
        count: staff.length
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch staff',
        message: error.message
      });
    }
  }

  // GET /api/staff/:id
  static async getStaffById(req, res) {
    try {
      const { id } = req.params;
      const staff = await BranchStaff.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password_hash'] }
          }
        ]
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        data: staff
      });
    } catch (error) {
      console.error('Error fetching staff member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch staff member',
        message: error.message
      });
    }
  }

  // POST /api/staff
  static async createStaff(req, res) {
    try {
      const { 
        branch_id, 
        user_id, 
        name, 
        role, 
        email, 
        phone, 
        hire_date, 
        salary, 
        status = 'active', 
        schedule 
      } = req.body;

      if (!branch_id || !name || !role || !email) {
        return res.status(400).json({
          success: false,
          error: 'Branch ID, name, role, and email are required'
        });
      }

      // Check if branch exists
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Branch not found'
        });
      }

      // If user_id is provided, check if user exists
      if (user_id) {
        const user = await User.findByPk(user_id);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        // Check if user is already staff of this branch
        const existingStaff = await BranchStaff.findOne({
          where: { branch_id, user_id }
        });

        if (existingStaff) {
          return res.status(409).json({
            success: false,
            error: 'User is already staff of this branch'
          });
        }
      }

      const staffData = {
        branch_id,
        user_id,
        name,
        role,
        email,
        phone,
        hire_date: hire_date || new Date().toISOString().split('T')[0],
        salary: salary || 0,
        status,
        schedule
      };

      const staff = await BranchStaff.create(staffData);

      // Fetch the created staff with associations
      const createdStaff = await BranchStaff.findByPk(staff.id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password_hash'] }
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdStaff,
        message: 'Staff member created successfully'
      });
    } catch (error) {
      console.error('Error creating staff member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create staff member',
        message: error.message
      });
    }
  }

  // PUT /api/staff/:id
  static async updateStaff(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        role, 
        email, 
        phone, 
        hire_date, 
        salary, 
        status, 
        schedule 
      } = req.body;

      const staff = await BranchStaff.findByPk(id);
      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (hire_date !== undefined) updateData.hire_date = hire_date;
      if (salary !== undefined) updateData.salary = salary;
      if (status !== undefined) updateData.status = status;
      if (schedule !== undefined) updateData.schedule = schedule;

      await staff.update(updateData);

      // Fetch the updated staff with associations
      const updatedStaff = await BranchStaff.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password_hash'] }
          }
        ]
      });

      res.json({
        success: true,
        data: updatedStaff,
        message: 'Staff member updated successfully'
      });
    } catch (error) {
      console.error('Error updating staff member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update staff member',
        message: error.message
      });
    }
  }

  // DELETE /api/staff/:id
  static async deleteStaff(req, res) {
    try {
      const { id } = req.params;

      const staff = await BranchStaff.findByPk(id);
      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      await staff.destroy();

      res.json({
        success: true,
        message: 'Staff member deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting staff member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete staff member',
        message: error.message
      });
    }
  }

  // GET /api/branches/:branchId/staff
  static async getStaffByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const { role, status } = req.query;

      let whereClause = { branch_id: branchId };
      if (role) whereClause.role = role;
      if (status) whereClause.status = status;

      const staff = await BranchStaff.findAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password_hash'] }
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: staff,
        count: staff.length
      });
    } catch (error) {
      console.error('Error fetching branch staff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch branch staff',
        message: error.message
      });
    }
  }
}

module.exports = StaffController;
