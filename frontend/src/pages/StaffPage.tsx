import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Phone, Building, Edit, Trash2, Clock, Shield, UserCheck } from 'lucide-react';
import type { BranchStaff, Branch, Company } from '../types';

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<BranchStaff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<BranchStaff | null>(null);

  // Mock data for now
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);

      const mockCompanies: Company[] = [
        {
          id: '1',
          name: 'Delicious Bites Restaurant Group',
          description: 'Premium dining experience',
          phone: '+1 (555) 123-4567',
          email: 'info@deliciousbites.com',
          address: '123 Main Street, Downtown',
          created_at: new Date().toISOString()
        }
      ];

      const mockBranches: Branch[] = [
        {
          id: '1',
          company_id: '1',
          name: 'Downtown Main Branch',
          address: '123 Main Street, Downtown, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'downtown@deliciousbites.com',
          manager_name: 'John Smith',
          status: 'active',
          opening_hours: '9:00 AM - 11:00 PM',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          company_id: '1',
          name: 'Westside Location',
          address: '789 West Ave, Westside, NY 10002',
          phone: '+1 (555) 234-5678',
          email: 'westside@deliciousbites.com',
          manager_name: 'Sarah Johnson',
          status: 'active',
          opening_hours: '10:00 AM - 10:00 PM',
          created_at: new Date().toISOString()
        }
      ];

      const mockStaff: BranchStaff[] = [
        {
          id: '1',
          branch_id: '1',
          name: 'John Smith',
          role: 'manager',
          email: 'john.smith@deliciousbites.com',
          phone: '+1 (555) 100-0001',
          hire_date: '2023-01-15',
          salary: 65000,
          status: 'active',
          schedule: 'Full-time',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          branch_id: '1',
          name: 'Emily Chen',
          role: 'chef',
          email: 'emily.chen@deliciousbites.com',
          phone: '+1 (555) 100-0002',
          hire_date: '2023-03-10',
          salary: 55000,
          status: 'active',
          schedule: 'Full-time',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          branch_id: '1',
          name: 'Mike Rodriguez',
          role: 'waiter',
          email: 'mike.rodriguez@deliciousbites.com',
          phone: '+1 (555) 100-0003',
          hire_date: '2023-06-01',
          salary: 35000,
          status: 'active',
          schedule: 'Part-time',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          branch_id: '2',
          name: 'Sarah Johnson',
          role: 'manager',
          email: 'sarah.johnson@deliciousbites.com',
          phone: '+1 (555) 100-0004',
          hire_date: '2022-11-20',
          salary: 67000,
          status: 'active',
          schedule: 'Full-time',
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          branch_id: '2',
          name: 'David Kim',
          role: 'cashier',
          email: 'david.kim@deliciousbites.com',
          phone: '+1 (555) 100-0005',
          hire_date: '2023-08-15',
          salary: 32000,
          status: 'active',
          schedule: 'Full-time',
          created_at: new Date().toISOString()
        },
        {
          id: '6',
          branch_id: '1',
          name: 'Lisa Wong',
          role: 'waiter',
          email: 'lisa.wong@deliciousbites.com',
          phone: '+1 (555) 100-0006',
          hire_date: '2023-09-01',
          salary: 33000,
          status: 'inactive',
          schedule: 'Part-time',
          created_at: new Date().toISOString()
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setCompanies(mockCompanies);
      setBranches(mockBranches);
      setStaff(mockStaff);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== staffId));
    }
  };

  const handleSaveStaff = (staffData: Partial<BranchStaff>) => {
    if (editingStaff) {
      // Update existing staff
      setStaff(prev => prev.map(s => 
        s.id === editingStaff.id ? { ...s, ...staffData } : s
      ));
    } else {
      // Add new staff
      const newStaff: BranchStaff = {
        id: Date.now().toString(),
        branch_id: staffData.branch_id || '',
        name: staffData.name || '',
        role: staffData.role || 'waiter',
        email: staffData.email || '',
        phone: staffData.phone || '',
        hire_date: staffData.hire_date || new Date().toISOString().split('T')[0],
        salary: staffData.salary || 0,
        status: staffData.status || 'active',
        schedule: staffData.schedule || 'Full-time',
        created_at: new Date().toISOString()
      };
      setStaff(prev => [...prev, newStaff]);
    }
    setShowAddModal(false);
    setEditingStaff(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage your restaurant staff and employees</p>
        </div>
        <button
          onClick={handleAddStaff}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-green-600">
                {staff.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-purple-600">
                {staff.filter(s => s.role === 'manager').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Salary</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(staff.reduce((sum, s) => sum + s.salary, 0) / staff.length || 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search staff by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
          >
            <option value="">All Roles</option>
            <option value="manager">Manager</option>
            <option value="chef">Chef</option>
            <option value="waiter">Waiter</option>
            <option value="cashier">Cashier</option>
            <option value="cleaner">Cleaner</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStaff.length} of {staff.length} staff members
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.schedule}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getBranchName(member.branch_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate max-w-32">{member.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(member.hire_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatCurrency(member.salary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStaff(member)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter || branchFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first staff member.'
              }
            </p>
            <button
              onClick={handleAddStaff}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Staff Member
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showAddModal && (
        <StaffModal
          staff={editingStaff}
          branches={branches}
          onSave={handleSaveStaff}
          onClose={() => {
            setShowAddModal(false);
            setEditingStaff(null);
          }}
        />
      )}
    </div>
  );
};

// Staff Modal Component
interface StaffModalProps {
  staff: BranchStaff | null;
  branches: Branch[];
  onSave: (staffData: Partial<BranchStaff>) => void;
  onClose: () => void;
}

const StaffModal: React.FC<StaffModalProps> = ({ staff, branches, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    branch_id: staff?.branch_id || '',
    name: staff?.name || '',
    role: staff?.role || 'waiter',
    email: staff?.email || '',
    phone: staff?.phone || '',
    hire_date: staff?.hire_date || new Date().toISOString().split('T')[0],
    salary: staff?.salary || 0,
    status: staff?.status || 'active',
    schedule: staff?.schedule || 'Full-time'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  required
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="cleaner">Cleaner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="staff@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hire Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Salary *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <select
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {staff ? 'Update Staff Member' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
