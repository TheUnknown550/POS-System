import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW()').then(result => {
  console.log('DB connected at:', result.rows[0].now);
}).catch(err => {
  console.error('DB connection error:', err);
});


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
