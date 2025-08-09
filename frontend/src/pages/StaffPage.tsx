import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Phone, Building, Edit, Trash2, Clock, Shield, UserCheck } from 'lucide-react';
import { apiService } from '../services/api';
import type { BranchStaff, Branch, Company } from '../types';

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<BranchStaff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<BranchStaff | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (branchFilter) params.branch_id = branchFilter;

      const [staffResponse, branchesResponse, companiesResponse] = await Promise.all([
        apiService.getStaff(params),
        apiService.getBranches(),
        apiService.getCompanies()
      ]);

      if (staffResponse.success && staffResponse.data) {
        setStaff(staffResponse.data);
      }

      if (branchesResponse.success && branchesResponse.data) {
        setBranches(branchesResponse.data);
      }

      if (companiesResponse.success && companiesResponse.data) {
        setCompanies(companiesResponse.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load staff data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, branchFilter]);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.phone && member.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === '' || member.role === roleFilter;
    const matchesBranch = branchFilter === '' || member.branch_id === branchFilter;
    return matchesSearch && matchesRole && matchesBranch;
  });

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'chef': return 'bg-orange-100 text-orange-800';
      case 'waiter': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      case 'cleaner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowAddModal(true);
  };

  const handleEditStaff = (staffMember: BranchStaff) => {
    setEditingStaff(staffMember);
    setShowAddModal(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await apiService.deleteStaff(staffId);
        setStaff(staff.filter(member => member.id !== staffId));
      } catch (err) {
        console.error('Error deleting staff member:', err);
        alert('Failed to delete staff member');
      }
    }
  };

  const handleSaveStaff = async (staffData: Partial<BranchStaff>) => {
    try {
      if (editingStaff) {
        // Update existing staff
        await apiService.updateStaff(editingStaff.id, staffData);
        setStaff(prev => prev.map(s =>
          s.id === editingStaff.id ? { ...s, ...staffData } : s
        ));
      } else {
        // Add new staff
        const response = await apiService.createStaff(staffData as any);
        if (response.success && response.data) {
          setStaff(prev => [...prev, response.data]);
        }
      }
      setShowAddModal(false);
      setEditingStaff(null);
    } catch (err) {
      console.error('Error saving staff member:', err);
      alert('Failed to save staff member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Staff</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadData} 
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage restaurant staff and their information</p>
        </div>
        <button
          onClick={handleAddStaff}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
              <option value="cashier">Cashier</option>
              <option value="cleaner">Cleaner</option>
            </select>
          </div>

          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredStaff.length} staff members
            </span>
          </div>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member: BranchStaff) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{getBranchName(member.branch_id)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditStaff(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteStaff(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>

                {member.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Hired: {new Date(member.hire_date).toLocaleDateString()}</span>
                </div>

                {member.schedule && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{member.schedule}</span>
                  </div>
                )}

                {member.salary && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-semibold text-green-600">
                      ${member.salary.toLocaleString()}/year
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || roleFilter || branchFilter 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first staff member.'
            }
          </p>
          <button 
            onClick={handleAddStaff}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Staff Member</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter staff name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Role</option>
                  <option value="manager">Manager</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                  <option value="cashier">Cashier</option>
                  <option value="cleaner">Cleaner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingStaff ? 'Update' : 'Add'} Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
