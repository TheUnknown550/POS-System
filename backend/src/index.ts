import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for your frontend origins
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'POS System Backend API is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
