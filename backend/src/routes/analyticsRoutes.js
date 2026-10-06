const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/users', analyticsController.getUserAnalytics);
router.get('/orders', analyticsController.getOrderAnalytics);
router.get('/products', analyticsController.getProductAnalytics);

module.exports = router;
