import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import employeeRoutes from './routes/employeeRoutes.js';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/employees', employeeRoutes);

export default app;
