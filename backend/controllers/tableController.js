const { BranchTable, Branch, Order } = require('../models');

class TableController {
  // GET /api/tables
  static async getAllTables(req, res) {
    try {
      const { branch_id, status } = req.query;
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

      if (status) {
        whereClause.status = status;
      }

      const tables = await BranchTable.findAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch',
            where: { company_id: userCompanyId }
          }
        ],
        order: [['table_number', 'ASC']]
      });

      res.json({
        success: true,
        data: tables,
        count: tables.length
      });
    } catch (error) {
      console.error('Error fetching tables:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tables',
        message: error.message
      });
    }
  }

  // GET /api/tables/:id
  static async getTableById(req, res) {
    try {
      const { id } = req.params;
      const table = await BranchTable.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: Order,
            as: 'orders',
            where: { status: ['pending', 'preparing', 'ready', 'served'] },
            required: false
          }
        ]
      });

      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        });
      }

      res.json({
        success: true,
        data: table
      });
    } catch (error) {
      console.error('Error fetching table:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch table',
        message: error.message
      });
    }
  }

  // GET /api/branches/:branchId/tables
  static async getTablesByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const { status } = req.query;
      
      let whereClause = { branch_id: branchId };
      if (status) {
        whereClause.status = status;
      }

      const tables = await BranchTable.findAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'orders',
            where: { status: ['pending', 'preparing', 'ready', 'served'] },
            required: false
          }
        ],
        order: [['table_number', 'ASC']]
      });

      res.json({
        success: true,
        data: tables,
        count: tables.length
      });
    } catch (error) {
      console.error('Error fetching branch tables:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch branch tables',
        message: error.message
      });
    }
  }

  // POST /api/tables
  static async createTable(req, res) {
    try {
      const { branch_id, table_number, status = 'available' } = req.body;

      if (!branch_id || !table_number) {
        return res.status(400).json({
          success: false,
          error: 'Branch ID and table number are required'
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

      // Check if table number already exists in this branch
      const existingTable = await BranchTable.findOne({
        where: { branch_id, table_number }
      });

      if (existingTable) {
        return res.status(409).json({
          success: false,
          error: 'Table number already exists in this branch'
        });
      }

      const table = await BranchTable.create({
        branch_id,
        table_number,
        status
      });

      // Fetch the created table with branch info
      const createdTable = await BranchTable.findByPk(table.id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdTable,
        message: 'Table created successfully'
      });
    } catch (error) {
      console.error('Error creating table:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create table',
        message: error.message
      });
    }
  }

  // PUT /api/tables/:id
  static async updateTable(req, res) {
    try {
      const { id } = req.params;
      const { table_number, status } = req.body;

      const table = await BranchTable.findByPk(id);
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        });
      }

      // Check if new table number already exists in this branch (if being updated)
      if (table_number && table_number !== table.table_number) {
        const existingTable = await BranchTable.findOne({
          where: { 
            branch_id: table.branch_id, 
            table_number 
          }
        });

        if (existingTable) {
          return res.status(409).json({
            success: false,
            error: 'Table number already exists in this branch'
          });
        }
      }

      await table.update({
        table_number: table_number || table.table_number,
        status: status || table.status
      });

      // Fetch updated table with branch info
      const updatedTable = await BranchTable.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          }
        ]
      });

      res.json({
        success: true,
        data: updatedTable,
        message: 'Table updated successfully'
      });
    } catch (error) {
      console.error('Error updating table:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update table',
        message: error.message
      });
    }
  }

  // PUT /api/tables/:id/status
  static async updateTableStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const validStatuses = ['available', 'occupied', 'reserved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const table = await BranchTable.findByPk(id);
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        });
      }

      await table.update({ status });

      res.json({
        success: true,
        data: table,
        message: 'Table status updated successfully'
      });
    } catch (error) {
      console.error('Error updating table status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update table status',
        message: error.message
      });
    }
  }

  // DELETE /api/tables/:id
  static async deleteTable(req, res) {
    try {
      const { id } = req.params;

      const table = await BranchTable.findByPk(id);
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        });
      }

      // Check if table has active orders
      const activeOrders = await Order.findAll({
        where: { 
          table_id: id,
          status: ['pending', 'preparing', 'ready', 'served']
        },
        limit: 1
      });

      if (activeOrders.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete table with active orders'
        });
      }

      await table.destroy();

      res.json({
        success: true,
        message: 'Table deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete table',
        message: error.message
      });
    }
  }
}

module.exports = TableController;
