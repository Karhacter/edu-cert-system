const Admin = require("../models/admin");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");

// Blockchain-based authentication

// Verify user is registered in blockchain
exports.verifyRegistration = async (req, res) => {
  try {
    const { ethAddress } = req.params;

    // Import contract ABI
    const contractABI =
      require("../artifacts/contracts/Admin.sol/Admin.json").abi;
    const { ethers } = require("ethers");

    // Configure Ethereum provider
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    const contract = new ethers.Contract(
      process.env.ADMIN_CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Check if user is registered as employee or organization
    const isEmployee = await contract.isEmployee(ethAddress);
    const isOrganization = await contract.isOrganizationEndorser(ethAddress);

    res.status(200).json({
      ethAddress,
      isRegistered: isEmployee || isOrganization,
      isEmployee,
      isOrganization,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      message: "Error verifying registration",
      error: error.message,
    });
  }
};

// Get user details from database
exports.getUserDetails = async (req, res) => {
  try {
    const { ethAddress } = req.params;

    const admin = await Admin.findOne({
      ethAddress: ethAddress.toLowerCase(),
      isActive: true,
    });

    if (!admin) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

// Admin username/password login issuing JWT
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!expectedUser || !expectedPass || !jwtSecret) {
      return res
        .status(500)
        .json({ message: "Auth is not configured on the server" });
    }

    if (username !== expectedUser || password !== expectedPass) {
      return res.status(401).json({ message: "Invalid Username and Password" });
    }

    const token = jwt.sign({ role: "admin", username }, jwtSecret, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Returns current authenticated user
exports.me = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
