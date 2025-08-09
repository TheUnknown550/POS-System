import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import type { BranchTable } from '../types';

const TablesPage: React.FC = () => {
  const { selectedBranch, currentCompany, currentBranch } = useCompany();
  const [tables, setTables] = useState<BranchTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('4');
  const [newTableStatus, setNewTableStatus] = useState('available');
  const [selectedTable, setSelectedTable] = useState<BranchTable | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadTables = async () => {
    if (!selectedBranch) {
      setTables([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getTablesByBranch(selectedBranch);
      if (response.success && response.data) {
        setTables(response.data);
      }
    } catch (err) {
      console.error('Error loading tables:', err);
      setError('Failed to load tables');
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBranch) {
      loadTables();
    } else {
      setTables([]);
      setIsLoading(false);
    }
  }, [selectedBranch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-6 h-6 text-white" />;
      case 'occupied': return <Users className="w-6 h-6 text-white" />;
      case 'reserved': return <Clock className="w-6 h-6 text-white" />;
      default: return <AlertCircle className="w-6 h-6 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'reserved': return 'Reserved';
      default: return 'Unknown';
    }
  };

  const updateTableStatus = async (tableId: string, newStatus: string) => {
    try {
      await apiService.updateTableStatus(tableId, newStatus);
      setTables(tables.map(table => 
        table.id === tableId ? { ...table, status: newStatus as any } : table
      ));
    } catch (err) {
      console.error('Error updating table status:', err);
      alert('Failed to update table status');
    }
  };

  const deleteTable = async (tableId: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await apiService.deleteTable(tableId);
        setTables(tables.filter(table => table.id !== tableId));
      } catch (err) {
        console.error('Error deleting table:', err);
        alert('Failed to delete table');
      }
    }
  };

  const editTable = (table: BranchTable) => {
    setSelectedTable(table);
    setShowEditModal(true);
  };

  const handleAddTable = async () => {
    if (!newTableNumber.trim()) {
      alert('Please enter a table number');
      return;
    }

    if (!selectedBranch) {
      alert('Please select a branch first');
      return;
    }

    try {
      const tableData = {
        table_number: newTableNumber,
        seats: parseInt(newTableSeats) || 4,
        status: newTableStatus as 'available' | 'occupied' | 'reserved',
        branch_id: selectedBranch
      };

      const response = await apiService.createTable(tableData);
      if (response.success && response.data) {
        setTables(prev => [...prev, response.data!]);
        setShowAddModal(false);
        setNewTableNumber('');
        setNewTableSeats('4');
        setNewTableStatus('available');
      }
    } catch (err) {
      console.error('Error creating table:', err);
      alert('Failed to create table');
    }
  };

  const statusCounts = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Tables</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadTables()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
          <p className="text-gray-600">
            Manage restaurant table layout and status
            {currentCompany && currentBranch && (
              <span className="text-blue-600"> • {currentCompany.name} - {currentBranch.name}</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadTables()}
            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedBranch}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Table
          </button>
        </div>
      </div>

      {/* Tables Display */}
      {selectedBranch && (
        <>
          {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tables</p>
              <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.available}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.occupied}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.reserved}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Table Layout</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(table => (
            <div
              key={table.id}
              className="relative group"
            >
              <div className={`
                w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer
                ${getStatusColor(table.status)} hover:scale-105 transition-transform
              `}>
                {getStatusIcon(table.status)}
                <span className="text-white font-bold mt-1">
                  {table.table_number}
                </span>
              </div>
              
              {/* Status Label */}
              <div className="text-center mt-2">
                <span className="text-xs text-gray-600">
                  {getStatusText(table.status)}
                </span>
              </div>

              {/* Action Buttons (show on hover) */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    onClick={() => editTable(table)}
                    className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Quick Status Change */}
              <div className="mt-2">
                <select
                  value={table.status}
                  onChange={(e) => updateTableStatus(table.id, e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Available - Ready for guests</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Occupied - Guests seated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Reserved - Reserved for later</span>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Table</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="text"
                  placeholder="Enter table number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  placeholder="4"
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(e.target.value)}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select 
                  value={newTableStatus}
                  onChange={(e) => setNewTableStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTable}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Table {selectedTable.table_number}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="text"
                  defaultValue={selectedTable.table_number}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  defaultValue={selectedTable.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default TablesPage;
