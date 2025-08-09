import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, MapPin, Users, Phone, Mail } from 'lucide-react';
import { apiService } from '../services/api';
import type { Company } from '../types';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state for adding new company
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const loadCompanies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getCompanies();
      if (response.success && response.data) {
        // Fetch branches for each company
        const companiesWithBranches = await Promise.all(
          response.data.map(async (company) => {
            try {
              const branchesResponse = await apiService.getBranchesByCompany(company.id);
              return {
                ...company,
                branches: branchesResponse.success ? branchesResponse.data : []
              };
            } catch (err) {
              console.error(`Error fetching branches for company ${company.id}:`, err);
              return { ...company, branches: [] };
            }
          })
        );
        setCompanies(companiesWithBranches);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const deleteCompany = async (companyId: string) => {
    if (window.confirm('Are you sure you want to delete this company? This will also delete all associated branches.')) {
      try {
        await apiService.deleteCompany(companyId);
        setCompanies(companies.filter(company => company.id !== companyId));
      } catch (err) {
        console.error('Error deleting company:', err);
        alert('Failed to delete company');
      }
    }
  };

  const editCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const createCompany = async () => {
    if (!newCompany.name.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      const response = await apiService.createCompany(newCompany);
      if (response.success && response.data) {
        setCompanies([...companies, { ...response.data, branches: [] }]);
        setNewCompany({ name: '', address: '', phone: '', email: '' });
        setShowAddModal(false);
        
        // If the response indicates re-authentication is needed
        if (response.requiresReauth) {
          alert('Company created successfully! Please log out and log back in to access all company features.');
        }
      }
    } catch (err) {
      console.error('Error creating company:', err);
      alert('Failed to create company');
    }
  };

  const totalBranches = companies.reduce((total, company) => total + (company.branches?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Companies</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadCompanies} 
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
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage restaurant companies and their information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Company
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-green-600">{totalBranches}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Branches/Company</p>
              <p className="text-2xl font-bold text-purple-600">
                {companies.length > 0 ? (totalBranches / companies.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map(company => (
          <div key={company.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">
                      {company.branches?.length || 0} branches
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editCompany(company)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCompany(company.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {company.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {company.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {company.email}
                </div>
              </div>

              {/* Branches List */}
              {company.branches && company.branches.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Branches</h4>
                  <div className="space-y-2">
                    {company.branches.map(branch => (
                      <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                          <p className="text-xs text-gray-600">{branch.address}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {branch.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Created: {new Date(company.created_at).toLocaleDateString()}</span>
                  <span>ID: {company.id}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first restaurant company.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Company
          </button>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Company</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter company address"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCompany({ name: '', address: '', phone: '', email: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCompany}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit {selectedCompany.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedCompany.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  defaultValue={selectedCompany.address}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue={selectedCompany.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedCompany.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
    </div>
  );
};

export default CompaniesPage;
