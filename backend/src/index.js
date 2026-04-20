import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import briefRouter from './routes/brief.js';
import accountsRouter from './routes/accounts.js';
import crmRouter from './routes/crm.js';

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'ANTHROPIC_API_KEY',
];

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy backend/.env.example to backend/.env and fill in your keys.');
  process.exit(1);
}

if (!process.env.SERPER_API_KEY) {
  console.warn('SERPER_API_KEY not set — News Pulse feature will be disabled.');
}

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/accounts', accountsRouter);
app.use('/api/brief', briefRouter);
app.use('/api/crm', crmRouter);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`Wingman backend running on http://localhost:${PORT}`);
});
