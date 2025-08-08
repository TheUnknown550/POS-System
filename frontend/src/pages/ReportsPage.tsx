import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock, Download, RefreshCw, BarChart3 } from 'lucide-react';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

const ReportsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('week');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  // Mock data for now
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);

      const mockSalesData: SalesData[] = [
        { date: '2024-01-01', revenue: 1250.50, orders: 45, customers: 38 },
        { date: '2024-01-02', revenue: 1180.25, orders: 42, customers: 35 },
        { date: '2024-01-03', revenue: 1450.75, orders: 52, customers: 44 },
        { date: '2024-01-04', revenue: 1320.00, orders: 48, customers: 40 },
        { date: '2024-01-05', revenue: 1680.90, orders: 58, customers: 49 },
        { date: '2024-01-06', revenue: 1890.45, orders: 67, customers: 55 },
        { date: '2024-01-07', revenue: 1756.30, orders: 62, customers: 51 }
      ];

      const mockTopProducts: TopProduct[] = [
        { id: '1', name: 'Margherita Pizza', category: 'Pizza', sales: 156, revenue: 2340.00 },
        { id: '2', name: 'Caesar Salad', category: 'Salads', sales: 89, revenue: 1246.00 },
        { id: '3', name: 'Grilled Chicken', category: 'Mains', sales: 134, revenue: 2680.00 },
        { id: '4', name: 'Chocolate Cake', category: 'Desserts', sales: 67, revenue: 469.00 },
        { id: '5', name: 'House Wine', category: 'Beverages', sales: 203, revenue: 1827.00 }
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setSalesData(mockSalesData);
      setTopProducts(mockTopProducts);
      setIsLoading(false);
    };

    loadMockData();
  }, [dateRange]);

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate growth (mock calculation)
  const revenueGrowth = 12.5;
  const orderGrowth = 8.3;
  const customerGrowth = 15.2;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track performance and gain insights into your business</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(revenueGrowth)}%
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center text-sm ${orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {orderGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(orderGrowth)}%
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className={`flex items-center text-sm ${customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {customerGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(customerGrowth)}%
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customers Served</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-sm text-gray-600">
              Avg. Order
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Sales</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {salesData.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{formatDate(day.date)}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(day.revenue)}</div>
                    <div className="text-xs text-gray-500">{day.orders} orders</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.revenue / Math.max(...salesData.map(d => d.revenue))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</div>
                  <div className="text-xs text-gray-500">{product.sales} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Peak Hours</h4>
            <p className="text-xs text-gray-600 mb-1">Busiest time: 7-9 PM</p>
            <p className="text-2xl font-bold text-green-600">67%</p>
            <p className="text-xs text-gray-500">of daily revenue</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Customer Retention</h4>
            <p className="text-xs text-gray-600 mb-1">Returning customers</p>
            <p className="text-2xl font-bold text-blue-600">42%</p>
            <p className="text-xs text-gray-500">of total orders</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Growth Rate</h4>
            <p className="text-xs text-gray-600 mb-1">Month over month</p>
            <p className="text-2xl font-bold text-purple-600">+23%</p>
            <p className="text-xs text-gray-500">revenue increase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
