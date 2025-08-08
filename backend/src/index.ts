import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for your frontend origins
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://45.154.24.169:5173',
    'http://45.154.24.169:5174'
  ],
  credentials: true,
}));

app.use(express.json());

// Import API routes
const apiRoutes = require('../routes');

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'POS System Backend API is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      branches: '/api/branches',
      products: '/api/products',
      categories: '/api/categories',
      tables: '/api/tables',
      orders: '/api/orders',
      payments: '/api/payments',
      reports: '/api/reports',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    uptime: process.uptime()
  });
});

// Mount API routes
app.use('/api', apiRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/`);
  console.log(`Network access available at http://45.154.24.169:${PORT}/`);
});
