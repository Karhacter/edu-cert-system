const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

// Employee routes
router.get("/details/:address", employeeController.getEmployeeDetails);
router.put("/update/:address", employeeController.updateEmployeeProfile);
router.get(
  "/certificates/:address",
  employeeController.getEmployeeCertificates
);

module.exports = router;
