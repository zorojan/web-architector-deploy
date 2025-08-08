import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase, getDatabase } from './database/init';
import settingsRoutes from './routes/settings';
import agentsRoutes from './routes/agents';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5180', 'http://localhost:3000'], // Frontend ports and Admin Panel
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/agents', agentsRoutes);

// Public endpoint for API key (needed by frontend)
app.get('/api/public/apikey', async (req, res) => {
  try {
    const { promisify } = require('util');
    
    const db = getDatabase();
    const get = promisify(db.get.bind(db)) as any;

    const setting = await get('SELECT value FROM settings WHERE key = ?', ['gemini_api_key']) as any;

    if (!setting || !setting.value) {
      return res.status(404).json({ error: 'API key not configured' });
    }

    res.json({ apiKey: setting.value });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ error: 'Failed to fetch API key' });
  }
});

// Public endpoint for agents (needed by frontend)
app.get('/api/public/agents', async (req, res) => {
  try {
    const { promisify } = require('util');
    
    const db = getDatabase();
    const all = promisify(db.all.bind(db)) as any;

    const agents = await all('SELECT * FROM agents ORDER BY created_at DESC') as any[];

    res.json(agents);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}).catch((error: any) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

export default app;
