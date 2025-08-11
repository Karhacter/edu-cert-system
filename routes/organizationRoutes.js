const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// Organization routes
router.get('/details/:address', organizationController.getOrganizationDetails);
router.put('/update/:address', organizationController.updateOrganizationProfile);
router.get('/certificates/:address', organizationController.getOrganizationCertificates);
router.post('/endorse/:address', organizationController.endorseCertificate);

module.exports = router;
