import express, { Request, Response } from 'express';
import { calculateRouter } from './routes/calculate';
import municipalitiesRouter from './routes/municipalities';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/calculate', calculateRouter);
app.use('/api/municipalities', municipalitiesRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
