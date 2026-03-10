// src/routes/research.routes.js
const express    = require('express');
const controller = require('../controllers/research.controller');
const { validateResearchRequest } = require('../middleware/validate');

const router = express.Router();

router.get('/health',               controller.health);
router.post('/research',            validateResearchRequest, controller.startResearch);
router.get('/research/:jobId',      controller.getResult);
router.delete('/research/:jobId',   controller.deleteJob);
router.get('/jobs',                 controller.listJobs);

module.exports = router;