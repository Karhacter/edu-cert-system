const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin routes for user management
router.post('/register', adminController.registerUser);
router.get('/is-employee/:address', adminController.isEmployee);
router.get('/is-organization/:address', adminController.isOrganizationEndorser);
router.get('/employees', adminController.getAllEmployees);
router.get('/organizations', adminController.getAllOrganizations);
router.get('/registration/:address', adminController.getUserRegistration);

module.exports = router;
