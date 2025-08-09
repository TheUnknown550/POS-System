import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle, X, Eye, DollarSign } from 'lucide-react';
import { apiService } from '../services/api';
import type { Order, Company, Branch } from '../types';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies();
      if (response.success && response.data) {
        setCompanies(response.data);
        if (response.data.length === 1) {
          setSelectedCompanyId(response.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadBranches = async (companyId: string) => {
    try {
      const response = await apiService.getBranchesByCompany(companyId);
      if (response.success && response.data) {
        setBranches(response.data);
        if (response.data.length === 1) {
          setSelectedBranchId(response.data[0].id);
        } else {
          setSelectedBranchId('');
          setOrders([]);
        }
      }
    } catch (err) {
      console.error('Error loading branches:', err);
      setBranches([]);
    }
  };

  const loadOrders = async (branchId: string) => {
    if (!branchId) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = { branch_id: branchId };
      if (statusFilter) params.status = statusFilter;
      
      const response = await apiService.getOrders(params);
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadBranches(selectedCompanyId);
    } else {
      setBranches([]);
      setSelectedBranchId('');
      setOrders([]);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedBranchId) {
      loadOrders(selectedBranchId);
    } else {
      setOrders([]);
    }
  }, [selectedBranchId, statusFilter]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.table_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'served': return <CheckCircle className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Orders</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadOrders(selectedBranchId)} 
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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Track and manage all restaurant orders</p>
        </div>
        <button
          onClick={() => setShowNewOrderModal(true)}
          disabled={!selectedBranchId}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Order
        </button>
      </div>

      {/* Company and Branch Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Company
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a company...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={!selectedCompanyId || branches.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Choose a branch...</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedCompanyId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Please select a company to view its branches and orders.
            </p>
          </div>
        )}

        {selectedCompanyId && branches.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              No branches found for this company. Create a branch first to manage orders.
            </p>
          </div>
        )}

        {selectedCompanyId && !selectedBranchId && branches.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Please select a branch to view its orders.
            </p>
          </div>
        )}
      </div>

      {/* Orders Display */}
      {selectedBranchId && (
        <>
          {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <span className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          <div className="flex gap-4">
            <span className="text-sm">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
              Pending: {orders.filter(o => o.status === 'pending').length}
            </span>
            <span className="text-sm">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
              Preparing: {orders.filter(o => o.status === 'preparing').length}
            </span>
            <span className="text-sm">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              Ready: {orders.filter(o => o.status === 'ready').length}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">
                    {order.table_id ? `Table ${order.table_id}` : 'Takeaway'} • {formatTime(order.order_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x Product #{item.product_id}</span>
                    <span className="text-gray-600">${(item.quantity * item.unit_price).toFixed(2)}</span>
                  </div>
                ))}
                {(order.items?.length ?? 0) > 3 && (
                  <div className="text-sm text-gray-500">
                    +{(order.items?.length ?? 0) - 3} more items
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg text-green-600">
                  ${Number(order.total_amount || 0).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  {getTimeAgo(order.order_date)}
                </span>
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Start Preparing
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Mark Ready
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'served')}
                    className="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Mark Served
                  </button>
                )}

                <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria.'
              : 'No orders have been placed yet.'
            }
          </p>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Order
          </button>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Order</h2>
            <p className="text-gray-600 mb-4">Order creation form will be implemented here.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Order
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

export default OrdersPage;
