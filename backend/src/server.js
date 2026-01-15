import "dotenv/config";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import interviewNewRoutes from './routes/interviewNew.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import questionRoutes from './routes/question.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import sessionRoutes from './routes/session.routes.js';
import reportRoutes from './routes/report.routes.js';
import skillAssessmentRoutes from './routes/skillAssessment.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (Postman, curl)
    if (!origin) return cb(null, true);

    // allow any localhost port during dev
    if (origin.startsWith("http://localhost:")) return cb(null, true);

    // allow your configured frontend url too
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true
}));


// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AI Interview Coach API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', authenticateToken, interviewRoutes);
app.use('/api/interview', authenticateToken, interviewNewRoutes); // New interview endpoints
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/questions', authenticateToken, questionRoutes);
app.use('/api/resume', resumeRoutes); // Resume routes (upload has auth middleware)
app.use('/api/sessions', sessionRoutes); // Session routes (all have auth middleware)
app.use('/api/report', reportRoutes); // Report routes (all have auth middleware)
app.use('/api/skill-assessment', skillAssessmentRoutes); // Skill assessment routes (public, no auth required)
app.use('/api/chat', chatRoutes); // ✅ Chat route

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 AI Interview Coach API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\n💡 To fix this, run one of the following commands:\n`);
    console.error(`   Option 1: Kill the process using port ${PORT}`);
    console.error(`   lsof -ti:${PORT} | xargs kill -9\n`);
    console.error(`   Option 2: Use a different port`);
    console.error(`   PORT=5002 npm run dev\n`);
    console.error(`   Option 3: Find what's using the port`);
    console.error(`   lsof -i:${PORT}\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

export default app;

