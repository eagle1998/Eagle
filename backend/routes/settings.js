const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const settingController = require('../controllers/settingController');
const { settingsReadLimiter } = require('../middleware/rateLimiter');

router.get('/', settingsReadLimiter, (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
  next();
}, settingController.getSettings);
router.put('/', authMiddleware, adminMiddleware, settingController.updateSettings);

module.exports = router;
