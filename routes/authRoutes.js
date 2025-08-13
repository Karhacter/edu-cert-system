const express = require("express");
const router = express.Router();
const { createRateLimit, authenticate } = require("../middleware/auth");
const authController = require("../controllers/authController");

// Rate limit login to mitigate brute force
const loginLimiter = createRateLimit(
  15 * 60 * 1000,
  20,
  "Too many login attempts, please try again later."
);

router.post("/login", loginLimiter, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
