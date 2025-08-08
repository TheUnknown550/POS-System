export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  branches?: Branch[];
  admins?: CompanyAdmin[];
}

export interface CompanyAdmin {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  created_at: string;
  user?: User;
  company?: Company;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  opening_hours?: string;
  created_at: string;
  company?: Company;
  tables?: BranchTable[];
  staff?: BranchStaff[];
}

export interface BranchStaff {
  id: string;
  branch_id: string;
  user_id?: string;
  name: string;
  role: 'manager' | 'chef' | 'waiter' | 'cashier' | 'cleaner';
  email: string;
  phone: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  schedule: string;
  created_at: string;
  user?: User;
  branch?: Branch;
}

export interface BranchTable {
  id: string;
  branch_id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved';
  created_at: string;
  branch?: Branch;
  orders?: Order[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  products?: Product[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  is_available?: boolean;
  sku?: string;
  created_at: string;
  category?: ProductCategory;
}

export interface Order {
  id: string;
  branch_id: string;
  table_id?: string;
  order_date: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  total_amount: number;
  branch?: Branch;
  table?: BranchTable;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  order?: Order;
  product?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface AuthUser {
  user: User;
  token: string;
  companies: Company[];
  role: string;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'cashier';

// Report Types
export interface ReportSummary {
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

export interface SalesReport {
  id: string;
  date: string;
  branch: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export interface DailyReport {
  date: string;
  totalOrders: number;
  totalSales: string;
  totalPayments: string;
  paidOrders: number;
  pendingOrders: number;
  averageOrderValue: string;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalOrders: number;
  totalSales: string;
  paidOrders: number;
  pendingOrders: number;
  averageOrderValue: string;
  dailyBreakdown: Record<number, { orders: number; sales: number }>;
}

export interface ProductReport {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface PaymentReport {
  key: string;
  total_amount: number;
  payment_count: number;
}
