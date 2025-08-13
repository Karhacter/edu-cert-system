const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Admin routes for user management
router.post(
  "/register",
  authenticate,
  authorizeAdmin,
  adminController.registerUser
);
router.get(
  "/is-employee/:address",
  authenticate,
  authorizeAdmin,
  adminController.isEmployee
);
router.get(
  "/is-organization/:address",
  authenticate,
  authorizeAdmin,
  adminController.isOrganizationEndorser
);
router.get(
  "/employees",
  authenticate,
  authorizeAdmin,
  adminController.getAllEmployees
);
router.get(
  "/organizations",
  authenticate,
  authorizeAdmin,
  adminController.getAllOrganizations
);
router.get(
  "/registration/:address",
  authenticate,
  authorizeAdmin,
  adminController.getUserRegistration
);

module.exports = router;
