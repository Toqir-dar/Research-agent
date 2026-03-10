// src/middleware/errorHandler.js

/**
 * Global error handler — catches all errors passed via next(err)
 * Always returns clean JSON to Angular, never crashes the server
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${req.method} ${req.path}]`, err.message);

  // Axios error from ML API
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error:   'ML API is not running',
      fix:     'Run: uvicorn api.server:app --port 8000',
      status:  503,
    });
  }

  // ML API returned an error
  if (err.response) {
    return res.status(err.response.status || 500).json({
      error:  err.response.data?.detail || 'ML API error',
      status: err.response.status,
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    error:  err.message || 'Internal server error',
    status: err.status  || 500,
  });
};

module.exports = errorHandler;