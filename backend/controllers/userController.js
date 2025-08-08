const { User, CompanyAdmin, BranchStaff } = require('../models');
const bcrypt = require('bcrypt');

class UserController {
  // GET /api/users
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: CompanyAdmin,
            as: 'companyAdminRoles',
            include: ['company']
          },
          {
            model: BranchStaff,
            as: 'branchStaffRoles',
            include: ['branch']
          }
        ]
      });
      
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }

  // GET /api/users/:id
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: CompanyAdmin,
            as: 'companyAdminRoles',
            include: ['company']
          },
          {
            model: BranchStaff,
            as: 'branchStaffRoles',
            include: ['branch']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user',
        message: error.message
      });
    }
  }

  // POST /api/users
  static async createUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        name,
        email,
        password_hash
      });

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password_hash;

      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user',
        message: error.message
      });
    }
  }

  // PUT /api/users/:id
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if email is being changed and if it already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: 'Email already exists'
          });
        }
      }

      await user.update({ name, email });

      const userResponse = user.toJSON();
      delete userResponse.password_hash;

      res.json({
        success: true,
        data: userResponse,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user',
        message: error.message
      });
    }
  }

  // DELETE /api/users/:id
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user',
        message: error.message
      });
    }
  }
}

module.exports = UserController;
