# POS System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API endpoints (except auth endpoints) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication
- `GET /auth/check-init` - Check if system needs initialization
- `POST /auth/register` - Register first user and create company
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile (requires auth)
- `POST /auth/logout` - User logout (requires auth)

### 🏢 Companies
- `GET /companies` - Get all companies
- `GET /companies/:id` - Get company by ID
- `POST /companies` - Create new company
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company
- `POST /companies/:id/admins` - Add company admin
- `GET /companies/:companyId/branches` - Get company branches

### 🏪 Branches
- `GET /branches` - Get all branches
- `GET /branches/:id` - Get branch by ID
- `POST /branches` - Create new branch
- `PUT /branches/:id` - Update branch
- `DELETE /branches/:id` - Delete branch
- `POST /branches/:id/staff` - Add branch staff
- `GET /branches/:branchId/tables` - Get branch tables
- `GET /branches/:branchId/orders` - Get branch orders

### 👥 Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### 🏷️ Categories
- `GET /categories` - Get all product categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category
- `GET /categories/:categoryId/products` - Get products by category

### 🍽️ Products
- `GET /products` - Get all products (supports ?category_id=uuid&search=term)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### 🪑 Tables
- `GET /tables` - Get all tables (supports ?branch_id=uuid&status=available)
- `GET /tables/:id` - Get table by ID
- `POST /tables` - Create new table
- `PUT /tables/:id` - Update table
- `PUT /tables/:id/status` - Update table status
- `DELETE /tables/:id` - Delete table

### 📋 Orders
- `GET /orders` - Get all orders (supports pagination and filters)
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status
- `POST /orders/:id/items` - Add item to order
- `GET /orders/:orderId/payments` - Get order payments

### 💰 Payments
- `GET /payments` - Get all payments (supports pagination and filters)
- `GET /payments/:id` - Get payment by ID
- `POST /payments` - Process payment
- `DELETE /payments/:id` - Refund payment

### 📊 Reports
- `GET /reports` - Get available reports
- `GET /reports/payments` - Payment reports (supports grouping and filtering)
- `GET /reports/sales` - Sales reports with date filtering
- `GET /reports/daily` - Daily summary report
- `GET /reports/monthly` - Monthly summary report  
- `GET /reports/products` - Product performance report
- `GET /reports/summary` - Dashboard summary statistics

### ⚕️ Health
- `GET /health` - API health check

## Authentication Examples

### Check System Initialization
```bash
GET /api/auth/check-init
```
Response:
```json
{
  "needsInitialization": true
}
```

### Register First User
```bash
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@restaurant.com", 
  "password": "securepassword123",
  "companyName": "My Restaurant",
  "companyAddress": "123 Main St",
  "companyPhone": "555-0123"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "admin@restaurant.com",
  "password": "securepassword123"
}
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@restaurant.com"
  },
  "token": "jwt-token-here"
}
```

## Report Examples

### Get Dashboard Summary
```bash
GET /api/reports/summary
```
Response:
```json
{
  "success": true,
  "data": {
    "today": {
      "orders": 15,
      "sales": "524.50"
    },
    "thisWeek": {
      "orders": 89,
      "sales": "3247.85"
    },
    "thisMonth": {
      "orders": 342,
      "sales": "12893.20"
    },
    "totals": {
      "orders": 1523,
      "sales": "45632.10",
      "products": 68,
      "branches": 3
    }
  }
}
```

### Get Sales Report
```bash
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-01-31&branchId=uuid
```

### Get Product Performance
```bash
GET /api/reports/products?startDate=2024-01-01&endDate=2024-01-31
```

## Example API Usage

### Create a Company
```bash
POST /api/companies
{
  "name": "My Restaurant Chain",
  "address": "456 Business Ave",
  "phone": "555-0199",
  "email": "contact@restaurant.com"
}
```

### Create a Branch
```bash
POST /api/branches
{
  "company_id": "uuid-here",
  "name": "Downtown Branch",
  "address": "123 Main St, City"
}
```

### Create a Product Category
```bash
POST /api/categories
{
  "name": "Beverages"
}
```

### Create a Product
```bash
POST /api/products
{
  "category_id": "uuid-here",
  "name": "Coffee",
  "price": 4.50,
  "sku": "BEV001"
}
```

### Create a Table
```bash
POST /api/tables
{
  "branch_id": "uuid-here",
  "table_number": "T01",
  "status": "available"
}
```

### Create an Order
```bash
POST /api/orders
{
  "branch_id": "uuid-here",
  "table_id": "uuid-here",
  "items": [
    {
      "product_id": "uuid-here",
      "quantity": 2
    },
    {
      "product_id": "uuid-here",
      "quantity": 1
    }
  ]
}
```

### Process Payment
```bash
POST /api/payments
{
  "order_id": "uuid-here",
  "amount": 15.50,
  "method": "card"
}
```

### Update Order Status
```bash
PUT /api/orders/:id/status
{
  "status": "preparing"
}
```

### Update Table Status
```bash
PUT /api/tables/:id/status
{
  "status": "occupied"
}
```

## Query Parameters

### Products
- `?category_id=uuid` - Filter by category
- `?search=term` - Search by product name

### Orders
- `?branch_id=uuid` - Filter by branch
- `?status=pending` - Filter by status
- `?table_id=uuid` - Filter by table
- `?date_from=2024-01-01` - Filter from date
- `?date_to=2024-01-31` - Filter to date
- `?limit=50` - Limit results
- `?offset=0` - Pagination offset

### Tables
- `?branch_id=uuid` - Filter by branch
- `?status=available` - Filter by status

### Payments
- `?order_id=uuid` - Filter by order
- `?method=card` - Filter by payment method
- `?date_from=2024-01-01` - Filter from date
- `?date_to=2024-01-31` - Filter to date

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "count": 150,
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "pages": 3
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

## Order Statuses
- `pending` - Order placed, not started
- `preparing` - Order being prepared
- `ready` - Order ready for serving
- `served` - Order delivered to table
- `paid` - Order fully paid
- `cancelled` - Order cancelled

## Table Statuses
- `available` - Table is free
- `occupied` - Table has customers
- `reserved` - Table is reserved

## Payment Methods
- `cash` - Cash payment
- `card` - Card payment
- `digital_wallet` - Digital wallet payment
- `bank_transfer` - Bank transfer

## User Roles
- `admin` - Company administrator
- `manager` - Branch manager
- `staff` - Branch staff
- `cashier` - Cashier
