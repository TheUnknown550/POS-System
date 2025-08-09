import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  User, 
  Company, 
  Branch, 
  Product, 
  ProductCategory, 
  BranchTable, 
  Order, 
  Payment,
  AuthUser 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://45.154.24.169:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async checkInitialization(): Promise<{ needsInitialization: boolean; hasUsers: boolean }> {
    try {
      const response: AxiosResponse<{ needsInitialization: boolean; hasUsers: boolean }> = 
        await this.api.get('/auth/check-init');
      return response.data;
    } catch (error) {
      console.error('Check initialization error:', error);
      return { needsInitialization: true, hasUsers: false };
    }
  }

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const response: AxiosResponse<{ 
        success: boolean;
        user: any; 
        token: string;
        message?: string;
      }> = await this.api.post('/auth/login', { email, password });
      
      // Handle the actual backend response structure
      const companies: Company[] = []; // Login doesn't return companies, we'll fetch them separately if needed
      
      const authUser: AuthUser = {
        user: response.data.user,
        token: response.data.token,
        companies: companies,
        role: response.data.user.role || 'admin'
      };
      
      localStorage.setItem('token', authUser.token);
      localStorage.setItem('user', JSON.stringify(authUser));
      return authUser;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthUser> {
    try {
      console.log('Making registration request to:', this.api.defaults.baseURL + '/auth/register');
      console.log('Registration data:', { name, email, password: '***' });
      
      const response: AxiosResponse<{ 
        success: boolean;
        user: any; 
        token: string; 
        company: Company | null;
        message?: string;
      }> = await this.api.post('/auth/register', { name, email, password });
      
      console.log('Registration response:', response.data);
      
      // Handle the actual backend response structure
      const companies = response.data.company ? [response.data.company] : [];
      
      const authUser: AuthUser = {
        user: response.data.user,
        token: response.data.token,
        companies: companies,
        role: response.data.user.role || 'admin'
      };
      
      localStorage.setItem('token', authUser.token);
      localStorage.setItem('user', JSON.stringify(authUser));
      return authUser;
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      }
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User Methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await this.api.get('/users');
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Company Methods
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    const response = await this.api.get('/companies');
    return response.data;
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    const response = await this.api.get(`/companies/${id}`);
    return response.data;
  }

  async createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    const response = await this.api.post('/companies', companyData);
    return response.data;
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    const response = await this.api.put(`/companies/${id}`, companyData);
    return response.data;
  }

  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/companies/${id}`);
    return response.data;
  }

  // Branch Methods
  async getBranches(): Promise<ApiResponse<Branch[]>> {
    const response = await this.api.get('/branches');
    return response.data;
  }

  async getBranchesByCompany(companyId: string): Promise<ApiResponse<Branch[]>> {
    const response = await this.api.get(`/companies/${companyId}/branches`);
    return response.data;
  }

  async getBranch(id: string): Promise<ApiResponse<Branch>> {
    const response = await this.api.get(`/branches/${id}`);
    return response.data;
  }

  async createBranch(branchData: Partial<Branch>): Promise<ApiResponse<Branch>> {
    const response = await this.api.post('/branches', branchData);
    return response.data;
  }

  async updateBranch(id: string, branchData: Partial<Branch>): Promise<ApiResponse<Branch>> {
    const response = await this.api.put(`/branches/${id}`, branchData);
    return response.data;
  }

  async deleteBranch(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/branches/${id}`);
    return response.data;
  }

  // Product Category Methods
  async getCategories(params?: { branch_id?: string }): Promise<ApiResponse<ProductCategory[]>> {
    const response = await this.api.get('/categories', { params });
    return response.data;
  }

  async createCategory(categoryData: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory>> {
    const response = await this.api.post('/categories', categoryData);
    return response.data;
  }

  async updateCategory(id: string, categoryData: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory>> {
    const response = await this.api.put(`/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/categories/${id}`);
    return response.data;
  }

  // Product Methods
  async getProducts(params?: { category_id?: string; search?: string; branch_id?: string }): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await this.api.post('/products', productData);
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await this.api.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  // Table Methods
  async getTables(params?: { branch_id?: string; status?: string }): Promise<ApiResponse<BranchTable[]>> {
    const response = await this.api.get('/tables', { params });
    return response.data;
  }

  async getTablesByBranch(branchId: string): Promise<ApiResponse<BranchTable[]>> {
    const response = await this.api.get(`/branches/${branchId}/tables`);
    return response.data;
  }

  async createTable(tableData: Partial<BranchTable>): Promise<ApiResponse<BranchTable>> {
    const response = await this.api.post('/tables', tableData);
    return response.data;
  }

  async updateTable(id: string, tableData: Partial<BranchTable>): Promise<ApiResponse<BranchTable>> {
    const response = await this.api.put(`/tables/${id}`, tableData);
    return response.data;
  }

  async updateTableStatus(id: string, status: string): Promise<ApiResponse<BranchTable>> {
    const response = await this.api.put(`/tables/${id}/status`, { status });
    return response.data;
  }

  async deleteTable(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/tables/${id}`);
    return response.data;
  }

  // Order Methods
  async getOrders(params?: { 
    branch_id?: string; 
    status?: string; 
    table_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Order[]>> {
    const response = await this.api.get('/orders', { params });
    return response.data;
  }

  async getOrdersByBranch(branchId: string, params?: {
    status?: string;
    date?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Order[]>> {
    const response = await this.api.get(`/branches/${branchId}/orders`, { params });
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: {
    branch_id: string;
    table_id?: string;
    items: { product_id: string; quantity: number }[];
  }): Promise<ApiResponse<Order>> {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    const response = await this.api.put(`/orders/${id}/status`, { status });
    return response.data;
  }

  async addOrderItem(orderId: string, item: { product_id: string; quantity: number }): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/orders/${orderId}/items`, item);
    return response.data;
  }

  // Payment Methods
  async getPayments(params?: {
    order_id?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Payment[]>> {
    const response = await this.api.get('/payments', { params });
    return response.data;
  }

  async getPaymentsByOrder(orderId: string): Promise<ApiResponse<Payment[]>> {
    const response = await this.api.get(`/orders/${orderId}/payments`);
    return response.data;
  }

  async createPayment(paymentData: {
    order_id: string;
    amount: number;
    method: string;
  }): Promise<ApiResponse<Payment>> {
    const response = await this.api.post('/payments', paymentData);
    return response.data;
  }

  async refundPayment(id: string, reason?: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/payments/${id}`, { data: { reason } });
    return response.data;
  }

  // Reports
  async getReports(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports');
    return response.data;
  }

  async getPaymentReport(params?: {
    branch_id?: string;
    date_from?: string;
    date_to?: string;
    method?: string;
    group_by?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/payments', { params });
    return response.data;
  }

  async getSalesReport(params?: {
    startDate?: string;
    endDate?: string;
    branchId?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/sales', { params });
    return response.data;
  }

  async getDailyReport(params?: {
    date?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/daily', { params });
    return response.data;
  }

  async getMonthlyReport(params?: {
    year?: number;
    month?: number;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/monthly', { params });
    return response.data;
  }

  async getProductReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/products', { params });
    return response.data;
  }

  async getSummaryReport(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/summary');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Staff Methods
  async getStaff(params?: { 
    branch_id?: string; 
    role?: string; 
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/staff', { params });
    return response.data;
  }

  async getStaffById(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/staff/${id}`);
    return response.data;
  }

  async createStaff(staffData: {
    branch_id: string;
    user_id?: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    hire_date?: string;
    salary?: number;
    status?: string;
    schedule?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/staff', staffData);
    return response.data;
  }

  async updateStaff(id: string, staffData: Partial<any>): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/staff/${id}`, staffData);
    return response.data;
  }

  async deleteStaff(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/staff/${id}`);
    return response.data;
  }

  async getStaffByBranch(branchId: string, params?: {
    role?: string;
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/branches/${branchId}/staff`, { params });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
