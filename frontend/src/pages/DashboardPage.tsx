import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Package, 
  CreditCard,
  Building,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ReportSummary, DailyReport } from '../types';

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalBranches: number;
  availableTables: number;
  occupiedTables: number;
  totalTables: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    weekOrders: 0,
    monthOrders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalBranches: 0,
    availableTables: 0,
    occupiedTables: 0,
    totalTables: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch summary report from backend
        const summaryResponse = await apiService.getSummaryReport();
        const summary: ReportSummary = summaryResponse.data;

        // Fetch today's detailed report
        const dailyResponse = await apiService.getDailyReport();
        const daily: DailyReport = dailyResponse.data;

        // Fetch tables data
        const tablesResponse = await apiService.getTables();
        const tables = tablesResponse.data || [];
        
        const availableTables = tables.filter(table => table.status === 'available').length;
        const occupiedTables = tables.filter(table => table.status === 'occupied').length;

        setStats({
          todayRevenue: parseFloat(summary.today.sales),
          todayOrders: summary.today.orders,
          weekOrders: summary.thisWeek.orders,
          monthOrders: summary.thisMonth.orders,
          totalOrders: summary.totals.orders,
          totalRevenue: parseFloat(summary.totals.sales),
          totalProducts: summary.totals.products,
          totalBranches: summary.totals.branches,
          availableTables,
          occupiedTables,
          totalTables: tables.length
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'New Order',
      description: 'Create a new customer order',
      icon: ShoppingCart,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/orders')
    },
    {
      title: 'View Products',
      description: 'Manage product catalog',
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/products')
    },
    {
      title: 'Table Management',
      description: 'Check table availability',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/tables')
    },
    {
      title: 'View Reports',
      description: 'Access sales analytics',
      icon: TrendingUp,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/reports')
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'table': return <Users className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'staff': return <UserCheck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'table': return 'text-purple-600 bg-purple-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'staff': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">Here's what's happening with your restaurant today.</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Today</p>
            <p className="text-white text-xl font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${stats.todayRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">
              ${stats.totalRevenue.toLocaleString()} total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-3xl font-bold text-blue-600">{stats.todayOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-gray-500">
              {stats.totalOrders} total orders
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Table Occupancy</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalTables > 0 ? Math.round((stats.occupiedTables / stats.totalTables) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {stats.occupiedTables}/{stats.totalTables} tables occupied
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Branches</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalBranches}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              All branches operational
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg`}
                >
                  <IconComponent className="w-8 h-8 mb-3" />
                  <p className="font-semibold text-lg">{action.title}</p>
                  <p className="text-sm opacity-90 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sales Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Today</span>
              <span className="text-lg font-bold text-blue-600">{stats.todayOrders} orders</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">This Week</span>
              <span className="text-lg font-bold text-green-600">{stats.weekOrders} orders</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-900">This Month</span>
              <span className="text-lg font-bold text-purple-600">{stats.monthOrders} orders</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/reports')}
            className="w-full mt-6 text-blue-600 hover:text-blue-700 font-medium text-center py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View detailed reports →
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-lg font-semibold">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Categories</span>
              <span className="text-lg font-semibold text-blue-600">Active</span>
            </div>
            <button 
              onClick={() => navigate('/products')}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Manage Products
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tables</h3>
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available</span>
              <span className="text-lg font-semibold text-green-600">{stats.availableTables}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Occupied</span>
              <span className="text-lg font-semibold text-red-600">{stats.occupiedTables}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-semibold">{stats.totalTables}</span>
            </div>
            <button 
              onClick={() => navigate('/tables')}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Manage Tables
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="text-lg font-semibold">
                ${stats.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branches</span>
              <span className="text-lg font-semibold text-green-600">{stats.totalBranches}</span>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
