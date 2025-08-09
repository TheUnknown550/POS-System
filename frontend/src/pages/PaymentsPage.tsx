import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, CreditCard, Smartphone, Building, RefreshCw, Download } from 'lucide-react';
import { apiService } from '../services/api';
import type { Payment } from '../types';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('today');

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = {};
      if (methodFilter) params.method = methodFilter;
      
      const response = await apiService.getPayments(params);
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [methodFilter, dateRange]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === '' || payment.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <DollarSign className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'digital_wallet': return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer': return <Building className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'digital_wallet': return 'bg-purple-100 text-purple-800';
      case 'bank_transfer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Credit/Debit Card';
      case 'digital_wallet': return 'Digital Wallet';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
  const failedPayments = filteredPayments.filter(p => p.status === 'failed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Payments</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPayments} 
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Track and manage payment transactions</p>
        </div>
        <div className="flex gap-2">
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedPayments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-red-600" />
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
              placeholder="Search by payment ID or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="digital_wallet">Digital Wallet</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    #{payment.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}>
                      {getMethodIcon(payment.method)}
                      {getMethodName(payment.method)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status || 'completed')}`}>
                      {(payment.status || 'completed').charAt(0).toUpperCase() + (payment.status || 'completed').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>
                      <div>{formatDate(payment.payment_date)}</div>
                      <div className="text-gray-400">{formatTime(payment.payment_date)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      {payment.status === 'completed' && (
                        <button className="text-red-600 hover:text-red-900">
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm || methodFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'No payments have been processed yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
