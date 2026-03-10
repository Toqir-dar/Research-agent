// src/app.js
require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const morgan         = require('morgan');
const researchRoutes = require('./routes/research.routes');
const errorHandler   = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin:         'http://localhost:4200',
  methods:        ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────────
app.use('/api', researchRoutes);

// ── Root ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status:  'online',
    service: 'Research Agent — Express Backend',
    version: '1.0.0',
    endpoints: {
      health:   'GET  /api/health',
      start:    'POST /api/research',
      poll:     'GET  /api/research/:jobId',
      delete:   'DELETE /api/research/:jobId',
      list:     'GET  /api/jobs',
    }
  });
});

// ── 404 ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error Handler (must be last) ────────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nExpress running on http://localhost:${PORT}`);
  console.log(`ML API target : ${process.env.ML_API_URL}`);
  console.log(`CORS origin   : http://localhost:4200`);
  console.log(`Endpoints ready:\n`);
  console.log(`   GET    http://localhost:${PORT}/api/health`);
  console.log(`   POST   http://localhost:${PORT}/api/research`);
  console.log(`   GET    http://localhost:${PORT}/api/research/:jobId`);
  console.log(`   DELETE http://localhost:${PORT}/api/research/:jobId`);
  console.log(`   GET    http://localhost:${PORT}/api/jobs\n`);
});

module.exports = app;