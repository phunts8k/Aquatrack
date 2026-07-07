const express = require('express');
const { body } = require('express-validator');
const {
  createUsage,
  getUsageLogs,
  updateUsage,
  deleteUsage,
} = require('../controllers/usageController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('liters').isFloat({ min: 0 }).withMessage('Liters must be a positive number'),
    body('date').optional().isISO8601().withMessage('Date must be valid'),
    body('location').optional().isString().isLength({ max: 60 }),
    body('note').optional().isString().isLength({ max: 200 }),
  ],
  validate,
  createUsage
);

router.get('/', getUsageLogs);

router.put(
  '/:id',
  [
    body('liters').optional().isFloat({ min: 0 }).withMessage('Liters must be a positive number'),
    body('date').optional().isISO8601().withMessage('Date must be valid'),
    body('location').optional().isString().isLength({ max: 60 }),
    body('note').optional().isString().isLength({ max: 200 }),
  ],
  validate,
  updateUsage
);

router.delete('/:id', deleteUsage);

module.exports = router;
