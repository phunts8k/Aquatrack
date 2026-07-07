const { validationResult } = require('express-validator');

// Runs after express-validator's chain of checks; short-circuits with a
// 400 response if any validation rule failed, listing all errors at once.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
