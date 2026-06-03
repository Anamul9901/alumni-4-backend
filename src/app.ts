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

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ['https://workspacex-eta.vercel.app', 'http://localhost:3000'], credentials: true }));

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
