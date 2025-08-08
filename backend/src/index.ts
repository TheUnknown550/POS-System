import express, { Request, Response } from 'express';
import { query } from './db';

const app = express();
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from TypeScript Express!');
});

// Type for user rows from DB
interface User {
  id: number;
  name: string;
  email: string;
}

// GET all users
app.get('/users', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM users');
    const users: User[] = result.rows;
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST add a new user
app.post('/users', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    const newUser: User = result.rows[0];
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
