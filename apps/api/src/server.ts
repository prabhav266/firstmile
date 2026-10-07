import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// ─── Crash protection ─────────────────────────────────────────────
// Express 4 does not catch rejected promises from async handlers. Without this
// a single failed DB/ML/SMTP call inside an async route can take the whole
// process down. This forwards any async error to the global errorHandler.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExpressLayer = require('express/lib/router/layer');
const originalHandleRequest = ExpressLayer.prototype.handle_request;
ExpressLayer.prototype.handle_request = function patchedHandleRequest(req: any, res: any, next: any) {
  const fn = this.handle;
  if (fn.length > 3) return next(); // error-handling middleware, leave as is
  try {
    const result = fn(req, res, next);
    if (result && typeof result.catch === 'function') result.catch(next);
  } catch (err) {
    next(err);
  }
};
void originalHandleRequest;

// Last-resort guards: log instead of letting Node kill the server
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

// Routes imports
import authRoutes from './routes/auth.routes';
import codingRoutes from './routes/coding.routes';
import skillsRoutes from './routes/skills.routes';
import analyticsRoutes from './routes/analytics.routes';
import resumeRoutes from './routes/resume.routes';
import roadmapRoutes from './routes/roadmap.routes';
import projectsRoutes from './routes/projects.routes';
import mlTrackerRoutes from './routes/mlTracker.routes';
import plannerRoutes from './routes/planner.routes';
import interviewRoutes from './routes/interview.routes';
import readinessRoutes from './routes/readiness.routes';
import tpoRoutes from './routes/tpo.routes';
import recruiterRoutes from './routes/recruiter.routes';
import evidenceRoutes from './routes/evidence.routes';

// Middleware imports
import { errorHandler } from './middleware/error.middleware';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local images to display on frontend
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads locally in development
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'firstmile-api' });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/ml', mlTrackerRoutes);
app.use('/api/ml-logs', mlTrackerRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/evidence', evidenceRoutes);

// 404 for unknown API routes (returns JSON instead of Express' HTML page)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, errors: null });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SERVER] PathForge API server listening on port ${PORT}`);
});

// Keep-alive must be longer than the hosting load balancer's idle timeout
// (Render/Heroku/AWS ALB ≈ 60s), otherwise users get random 502 errors.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

// Graceful shutdown so in-flight requests finish and DB connections close
const shutdown = (signal: string) => {
  console.log(`[SERVER] ${signal} received, shutting down gracefully`);
  server.close(async () => {
    try { await prisma.$disconnect(); } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
