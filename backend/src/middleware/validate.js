// src/middleware/validate.js

/**
 * Validates POST /api/research request body
 * Rejects bad requests before they reach the ML API
 */
const validateResearchRequest = (req, res, next) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({
      error:  'topic is required',
      status: 400,
    });
  }

  if (typeof topic !== 'string') {
    return res.status(400).json({
      error:  'topic must be a string',
      status: 400,
    });
  }

  if (topic.trim().length < 5) {
    return res.status(400).json({
      error:  'topic must be at least 5 characters',
      status: 400,
    });
  }

  if (topic.trim().length > 300) {
    return res.status(400).json({
      error:  'topic must be under 300 characters',
      status: 400,
    });
  }

  // Sanitize — trim whitespace
  req.body.topic = topic.trim();
  next();
};

module.exports = { validateResearchRequest };