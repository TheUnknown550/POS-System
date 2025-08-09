import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  BarChart3,
  Calendar
} from 'lucide-react';
import { apiService } from '../services/api';
import { useCompany } from '../context/CompanyContext';

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

interface SummaryData {
  today: {
    orders: number;
    sales: string;
  };
  thisWeek: {
    orders: number;
    sales: string;
  };
  thisMonth: {
    orders: number;
    sales: string;
  };
  totals: {
    orders: number;
    sales: string;
    products: number;
    branches: number;
  };
}

const ReportsPage: React.FC = () => {
  const { selectedCompany, selectedBranch, currentCompany, currentBranch } = useCompany();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growthData, setGrowthData] = useState({
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0
  });

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const loadReportsData = async () => {
    if (!selectedCompany) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setDate(endDate.getDate());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      // Calculate previous period for growth comparison
      const periodLength = endDate.getTime() - startDate.getTime();
      const previousEndDate = new Date(startDate.getTime() - 1);
      const previousStartDate = new Date(startDate.getTime() - periodLength);

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...(selectedBranch && { branchId: selectedBranch })
      };

      const previousParams = {
        startDate: previousStartDate.toISOString().split('T')[0],
        endDate: previousEndDate.toISOString().split('T')[0],
        ...(selectedBranch && { branchId: selectedBranch })
      };

      const [summaryResponse, salesResponse, productResponse, previousSalesResponse] = await Promise.all([
        apiService.getSummaryReport(),
        apiService.getSalesReport(params),
        apiService.getProductReport(params),
        apiService.getSalesReport(previousParams)
      ]);

      if (summaryResponse.success) {
        setSummaryData(summaryResponse.data);
      }

      if (salesResponse.success && salesResponse.data) {
        // Transform sales data to match the expected format
        const transformedSalesData: SalesData[] = salesResponse.data.map((item: any) => ({
          date: item.date,
          revenue: parseFloat(item.total) || 0,
          orders: 1, // Each item represents an order
          customers: 1 // Estimate unique customers (could be improved with actual customer tracking)
        }));
        setSalesData(transformedSalesData);

        // Calculate growth rates
        if (previousSalesResponse.success && previousSalesResponse.data) {
          const currentRevenue = transformedSalesData.reduce((sum, day) => sum + day.revenue, 0);
          const currentOrders = transformedSalesData.length;
          const currentCustomers = transformedSalesData.length; // Simple estimate

          const previousRevenue = previousSalesResponse.data.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || 0), 0);
          const previousOrders = previousSalesResponse.data.length;
          const previousCustomers = previousSalesResponse.data.length;

          setGrowthData({
            revenueGrowth: calculateGrowth(currentRevenue, previousRevenue),
            orderGrowth: calculateGrowth(currentOrders, previousOrders),
            customerGrowth: calculateGrowth(currentCustomers, previousCustomers)
          });
        }
      }

      if (productResponse.success && productResponse.data) {
        // Transform product data to match the expected format
        const transformedProducts: TopProduct[] = productResponse.data.map((item: any) => ({
          id: Math.random().toString(),
          name: item.name,
          category: 'General', // Category not provided in product report
          sales: item.totalQuantity,
          revenue: item.totalRevenue
        }));
        setTopProducts(transformedProducts);
      }
    } catch (err) {
      console.error('Error loading reports data:', err);
      setError('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      loadReportsData();
    } else {
      setIsLoading(false);
    }
  }, [dateRange, selectedBranch, selectedCompany]);

  // Use summary data if available, otherwise calculate from sales data
  const totalRevenue = summaryData ? parseFloat(summaryData.totals?.sales || '0') : salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = summaryData ? summaryData.totals?.orders || 0 : salesData.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Use calculated growth data
  const { revenueGrowth, orderGrowth, customerGrowth } = growthData;

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Reports</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadReportsData} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // This content will only show when user has selected company via global context
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Viewing data for {currentCompany?.name || 'Unknown Company'} - {currentBranch?.name || 'Unknown Branch'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
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
            {salesData.length > 0 ? (
              salesData.map((day) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No sales data available</p>
                <p className="text-gray-400 text-xs">Create orders to see daily sales analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No product data available</p>
                <p className="text-gray-400 text-xs">Add products and create orders to see analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Average Order Value</h4>
            <p className="text-xs text-gray-600 mb-1">Per transaction</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(avgOrderValue)}</p>
            <p className="text-xs text-gray-500">across all orders</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Revenue Growth</h4>
            <p className="text-xs text-gray-600 mb-1">vs previous period</p>
            <p className={`text-2xl font-bold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">period comparison</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Growth</h4>
            <p className="text-xs text-gray-600 mb-1">vs previous period</p>
            <p className={`text-2xl font-bold ${orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {orderGrowth >= 0 ? '+' : ''}{orderGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">order volume change</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
