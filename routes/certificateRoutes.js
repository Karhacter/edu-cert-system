const express = require('express');
const router = express.Router();
const multer = require('multer');
const certificateController = require('../controllers/certificateController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Routes
router.post('/issue', upload.single('certificate'), certificateController.issueCertificate);
router.get('/verify/:certificateId', certificateController.verifyCertificate);
router.post('/revoke/:certificateId', certificateController.revokeCertificate);
router.get('/all', certificateController.getAllCertificates);

module.exports = router; 