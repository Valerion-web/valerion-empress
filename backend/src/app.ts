import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import router from './routes/index.js';
import { env } from './config/env.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error-handler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', router);

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend healthy', data: { status: 'ok' }, errors: [] });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app, httpServer, io };
