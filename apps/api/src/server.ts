import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

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

// Middleware imports
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local images to display on frontend
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads locally in development
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[SERVER] PathForge API server listening on http://localhost:${PORT}`);
});
