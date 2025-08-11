const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/stats', dashboardController.getDashboardStats);
router.get('/health', dashboardController.getSystemHealth);

module.exports = router;
