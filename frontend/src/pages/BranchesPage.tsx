import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone, Mail, Users, Edit, Trash2, Building, Clock } from 'lucide-react';
import { apiService } from '../services/api';
import type { Branch, Company } from '../types';

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [branchesResponse, companiesResponse] = await Promise.all([
        apiService.getBranches(),
        apiService.getCompanies()
      ]);

      if (branchesResponse.success && branchesResponse.data) {
        setBranches(branchesResponse.data);
      }

      if (companiesResponse.success && companiesResponse.data) {
        setCompanies(companiesResponse.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load branches and companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         (branch.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCompany = companyFilter === '' || branch.company_id === companyFilter;
    return matchesSearch && matchesCompany;
  });

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    setShowAddModal(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setShowAddModal(true);
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await apiService.deleteBranch(branchId);
        setBranches(prev => prev.filter(b => b.id !== branchId));
      } catch (err) {
        console.error('Error deleting branch:', err);
        alert('Failed to delete branch');
      }
    }
  };

  const handleSaveBranch = async (branchData: Partial<Branch>) => {
    try {
      if (editingBranch) {
        // Update existing branch
        await apiService.updateBranch(editingBranch.id, branchData);
        setBranches(prev => prev.map(b => 
          b.id === editingBranch.id ? { ...b, ...branchData } : b
        ));
      } else {
        // Add new branch
        const response = await apiService.createBranch(branchData);
        if (response.success && response.data) {
          setBranches(prev => [...prev, response.data!]);
        }
      }
      setShowAddModal(false);
      setEditingBranch(null);
    } catch (err) {
      console.error('Error saving branch:', err);
      alert('Failed to save branch');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Branches</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600">Manage your restaurant branches and locations</p>
        </div>
        <button
          onClick={handleAddBranch}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Branch
        </button>
      </div>

      {/* Company Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Company
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Branches
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, address, or manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {companyFilter && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Showing branches for: <strong>
                {companies.find(c => c.id === companyFilter)?.name || 'Unknown Company'}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-blue-600">{branches.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Branches</p>
              <p className="text-2xl font-bold text-green-600">
                {branches.filter(b => b.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-purple-600">{companies.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {branches.filter(b => b.status === 'inactive').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Building className="w-6 h-6 text-red-600" />
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
              placeholder="Search branches by name, address, or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredBranches.length} of {branches.length} branches
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map(branch => (
          <div key={branch.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{branch.name}</h3>
                  <p className="text-sm text-gray-600">{getCompanyName(branch.company_id)}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(branch.status)}`}>
                  {branch.status ? branch.status.charAt(0).toUpperCase() + branch.status.slice(1) : 'Unknown'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-2">{branch.address}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{branch.phone}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{branch.email}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Manager: {branch.manager_name}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{branch.opening_hours}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t flex justify-end space-x-2">
              <button
                onClick={() => handleEditBranch(branch)}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteBranch(branch.id)}
                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || companyFilter 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first branch location.'
            }
          </p>
          <button
            onClick={handleAddBranch}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Branch
          </button>
        </div>
      )}

      {/* Add/Edit Branch Modal */}
      {showAddModal && (
        <BranchModal
          branch={editingBranch}
          companies={companies}
          onSave={handleSaveBranch}
          onClose={() => {
            setShowAddModal(false);
            setEditingBranch(null);
          }}
        />
      )}
    </div>
  );
};

// Branch Modal Component
interface BranchModalProps {
  branch: Branch | null;
  companies: Company[];
  onSave: (branchData: Partial<Branch>) => void;
  onClose: () => void;
}

const BranchModal: React.FC<BranchModalProps> = ({ branch, companies, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    company_id: branch?.company_id || '',
    name: branch?.name || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    manager_name: branch?.manager_name || '',
    status: branch?.status || 'active',
    opening_hours: branch?.opening_hours || ''
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
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter branch name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full address"
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
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="branch@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter manager name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="9:00 AM - 10:00 PM"
                />
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
                {branch ? 'Update Branch' : 'Add Branch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BranchesPage;
