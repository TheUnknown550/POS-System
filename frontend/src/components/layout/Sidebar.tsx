import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Users, 
  Package, 
  ShoppingCart, 
  Receipt, 
  CreditCard,
  BarChart3,
  Settings,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const {
    companies,
    branches,
    selectedCompany,
    selectedBranch,
    currentCompany,
    currentBranch,
    setSelectedCompany,
    setSelectedBranch,
    hasValidSelection
  } = useCompany();

  const handleCreateCompany = () => {
    navigate('/companies');
  };

  const handleCreateBranch = () => {
    navigate('/branches');
  };

  // Always show company selection - users need to select a company to access the system
  const showCompanySelection = true;

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-blue-500'
    },
    {
      label: 'Companies',
      icon: Building2,
      path: '/companies',
      color: 'text-green-500'
    },
    {
      label: 'Branches',
      icon: MapPin,
      path: '/branches',
      color: 'text-purple-500'
    },
    {
      label: 'Staff',
      icon: Users,
      path: '/staff',
      color: 'text-orange-500'
    },
    {
      label: 'Products',
      icon: Package,
      path: '/products',
      color: 'text-indigo-500'
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      path: '/orders',
      color: 'text-red-500'
    },
    {
      label: 'Tables',
      icon: Receipt,
      path: '/tables',
      color: 'text-teal-500'
    },
    {
      label: 'Payments',
      icon: CreditCard,
      path: '/payments',
      color: 'text-yellow-600'
    },
    {
      label: 'Reports',
      icon: BarChart3,
      path: '/reports',
      color: 'text-pink-500'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      color: 'text-gray-500'
    }
  ];

  return (
    <aside className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold">POS System</h2>
              <p className="text-xs text-gray-400">Restaurant Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Company/Branch Selection */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700 space-y-3">
          {/* Company Selection */}
          {showCompanySelection && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Company</label>
              <div className="relative">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">Select Company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {companies.length === 0 && (
                <button
                  onClick={handleCreateCompany}
                  className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 text-xs text-blue-400 hover:text-blue-300 border border-gray-600 hover:border-blue-500 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Company</span>
                </button>
              )}
            </div>
          )}

          {/* Branch Selection */}
          {selectedCompany && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Branch</label>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  disabled={branches.length === 0}
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {branches.length === 0 && (
                <button
                  onClick={handleCreateBranch}
                  className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 text-xs text-blue-400 hover:text-blue-300 border border-gray-600 hover:border-blue-500 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Branch</span>
                </button>
              )}
            </div>
          )}

          {/* Current Selection Display */}
          {hasValidSelection && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                <div className="truncate">
                  <span className="font-medium">Company:</span> {currentCompany?.name}
                </div>
                {currentBranch && (
                  <div className="truncate">
                    <span className="font-medium">Branch:</span> {currentBranch.name}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      isCollapsed ? 'mx-auto' : ''
                    }`} 
                  />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-6">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>&copy; 2024 POS System</p>
            <p>v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
