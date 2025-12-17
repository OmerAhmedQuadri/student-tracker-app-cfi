import './types/express';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { initJobs } from './jobs';

const app = express();

// Connect to Database
connectDB();

// Initialize Cron Jobs
initJobs();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
});

export default app;

