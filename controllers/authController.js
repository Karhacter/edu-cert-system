const Admin = require("../models/admin");
const { ethers } = require("ethers");

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
