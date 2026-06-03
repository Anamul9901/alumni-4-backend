/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import * as path from 'path';
import mongoose from 'mongoose';
import config from './app/config';
import { seedDatabase } from './app/utils/seed';

const app: Application = express();

// Database connection logic for Vercel Serverless environment
let cachedConnectionPromise: Promise<typeof mongoose> | null = null;

if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
  // Pre-connect on cold start (non-blocking)
  mongoose.connect(config.database_url as string).then(async (m) => {
    console.log('Database pre-connected on Vercel cold start.');
    await seedDatabase();
  }).catch((err) => {
    console.error('Database pre-connection failed on cold start:', err);
  });
}

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ['https://workspacex-ten.vercel.app', 'http://localhost:3000'], credentials: true }));

// Serverless DB connection assurance middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // If Vercel/Production or not connected, connect
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    try {
      if (!cachedConnectionPromise) {
        console.log('Initializing database connection on request...');
        cachedConnectionPromise = mongoose.connect(config.database_url as string).then(async (m) => {
          console.log('Database connected successfully via middleware.');
          await seedDatabase();
          return m;
        });
      }
      await cachedConnectionPromise;
      next();
    } catch (err) {
      cachedConnectionPromise = null; // Reset cache on failure
      console.error('Database connection middleware error:', err);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    next();
  }
});

// show image in browser
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('WorkspaceX Server is running !');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
