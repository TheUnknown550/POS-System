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

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeCustomers: number;
  monthlyGrowth: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockItems: number;
  totalProducts: number;
  activeBranches: number;
  totalStaff: number;
  availableTables: number;
  totalTables: number;
  processingPayments: number;
}

interface RecentActivity {
  id: number;
  action: string;
  time: string;
  type: 'order' | 'payment' | 'table' | 'alert' | 'staff';
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    activeCustomers: 0,
    monthlyGrowth: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockItems: 0,
    totalProducts: 0,
    activeBranches: 0,
    totalStaff: 0,
    availableTables: 0,
    totalTables: 0,
    processingPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching comprehensive dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock comprehensive dashboard data based on all system components
      setStats({
        todayRevenue: 3247.85,
        todayOrders: 47,
        activeCustomers: 142,
        monthlyGrowth: 12.5,
        pendingOrders: 8,
        completedOrders: 39,
        lowStockItems: 5,
        totalProducts: 68,
        activeBranches: 3,
        totalStaff: 24,
        availableTables: 8,
        totalTables: 15,
        processingPayments: 3
      });
      
      setIsLoading(false);
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

  const recentActivities: RecentActivity[] = [
    { id: 1, action: 'New order #1247 received from Table 5', time: '2 minutes ago', type: 'order' },
    { id: 2, action: 'Payment of $45.99 processed successfully', time: '5 minutes ago', type: 'payment' },
    { id: 3, action: 'Table 7 marked as available', time: '8 minutes ago', type: 'table' },
    { id: 4, action: 'Low stock alert: Caesar Salad ingredients', time: '12 minutes ago', type: 'alert' },
    { id: 5, action: 'New staff member David Kim added', time: '1 hour ago', type: 'staff' }
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
            <span className="text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
            <span className="text-gray-500 ml-1">from last month</span>
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
              {stats.completedOrders} completed, {stats.pendingOrders} pending
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Table Occupancy</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(((stats.totalTables - stats.availableTables) / stats.totalTables) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {stats.totalTables - stats.availableTables}/{stats.totalTables} tables occupied
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Staff On Duty</p>
              <p className="text-3xl font-bold text-orange-600">{Math.round(stats.totalStaff * 0.75)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserCheck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              of {stats.totalStaff} total staff
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
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

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/reports')}
            className="w-full mt-6 text-blue-600 hover:text-blue-700 font-medium text-center py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View all activity →
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-lg font-semibold">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Stock</span>
              <span className="text-lg font-semibold text-green-600">{stats.totalProducts - stats.lowStockItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="text-lg font-semibold text-red-600">{stats.lowStockItems}</span>
            </div>
            <button 
              onClick={() => navigate('/products')}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Manage Inventory
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Operations</h3>
            <Building className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Branches</span>
              <span className="text-lg font-semibold text-green-600">{stats.activeBranches}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Staff</span>
              <span className="text-lg font-semibold">{stats.totalStaff}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available Tables</span>
              <span className="text-lg font-semibold text-blue-600">{stats.availableTables}</span>
            </div>
            <button 
              onClick={() => navigate('/branches')}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Manage Operations
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
            <CreditCard className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="text-lg font-semibold">${(stats.todayRevenue / stats.todayOrders).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processing</span>
              <span className="text-lg font-semibold text-yellow-600">{stats.processingPayments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-lg font-semibold text-green-600">98.5%</span>
            </div>
            <button 
              onClick={() => navigate('/payments')}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              View Payments
            </button>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      {stats.lowStockItems > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Inventory Alert</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You have {stats.lowStockItems} items running low on stock. 
                <button 
                  onClick={() => navigate('/products')}
                  className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                >
                  Review inventory →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
