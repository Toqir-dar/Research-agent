// src/services/ml.service.js
const axios = require('axios');

const mlClient = axios.create({
  baseURL: process.env.ML_API_URL || 'http://localhost:8000',
  timeout: 300000,
  headers: { 'Content-Type': 'application/json' },
});

// Log every ML API call
mlClient.interceptors.request.use(req => {
  console.log(`   ML API -> ${req.method.toUpperCase()} ${req.baseURL}${req.url}`);
  return req;
});

const startResearch   = (topic)  => mlClient.post('/research', { topic }).then(r => r.data);
const getResult       = (jobId)  => mlClient.get(`/research/${jobId}`).then(r => r.data);
const listJobs        = ()       => mlClient.get('/jobs').then(r => r.data);
const deleteJob       = (jobId)  => mlClient.delete(`/research/${jobId}`).then(r => r.data);
const checkHealth     = ()       => mlClient.get('/health').then(r => r.data);

module.exports = { startResearch, getResult, listJobs, deleteJob, checkHealth };