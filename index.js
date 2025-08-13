const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");
const certificateRoutes = require("./routes/certificateRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

const port = process.env.PORT;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/certificates", certificateRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Blockchain Certificate Validation API");
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
