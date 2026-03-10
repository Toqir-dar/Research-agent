// src/controllers/research.controller.js
const mlService = require('../services/ml.service');

// POST /api/research
const startResearch = async (req, res, next) => {
  try {
    const { topic } = req.body;  // already validated + trimmed
    console.log(`Starting research: "${topic}"`);
    const result = await mlService.startResearch(topic);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/research/:jobId
const getResult = async (req, res, next) => {
  try {
    const result = await mlService.getResult(req.params.jobId);
    res.json(result);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        error:  `Job '${req.params.jobId}' not found`,
        status: 404,
      });
    }
    next(err);
  }
};

// GET /api/jobs
const listJobs = async (req, res, next) => {
  try {
    const jobs = await mlService.listJobs();
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/research/:jobId
const deleteJob = async (req, res, next) => {
  try {
    const result = await mlService.deleteJob(req.params.jobId);
    res.json(result);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Job not found', status: 404 });
    }
    next(err);
  }
};

// GET /api/health
const health = async (req, res, next) => {
  try {
    const mlHealth = await mlService.checkHealth();
    res.json({ express: 'healthy', ml_api: mlHealth });
  } catch (err) {
    res.status(503).json({ express: 'healthy', ml_api: 'unreachable' });
  }
};

module.exports = { startResearch, getResult, listJobs, deleteJob, health };