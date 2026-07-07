const rateLimit = require('express-rate-limit');

// Limits login attempts to slow down brute-force credential guessing.
// Scoped only to the login route since that's the sole place it's needed.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in a few minutes.',
  },
});

module.exports = { loginLimiter };
