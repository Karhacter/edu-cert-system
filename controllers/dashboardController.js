const { ethers } = require("ethers");
const Admin = require('../models/admin');
const Employee = require('../models/employee');
const Organization = require('../models/organization');
const Certificate = require('../models/certificate');

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      totalOrganizations,
      totalCertificates,
      activeCertificates,
      revokedCertificates
    ] = await Promise.all([
      Employee.countDocuments(),
      Organization.countDocuments(),
      Certificate.countDocuments(),
      Certificate.countDocuments({ isValid: true }),
      Certificate.countDocuments({ isValid: false })
    ]);

    const recentRegistrations = await Admin.find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .select('name role registeredAt');

    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('studentName courseName issueDate isValid');

    res.status(200).json({
      statistics: {
        totalEmployees,
        totalOrganizations,
        totalCertificates,
        activeCertificates,
        revokedCertificates
      },
      recentRegistrations,
      recentCertificates
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// Get system health status
exports.getSystemHealth = async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    const blockNumber = await provider.getBlockNumber();
    
    res.status(200).json({
      blockchain: {
        connected: true,
        blockNumber,
        network: 'Sepolia'
      },
      database: {
        connected: true,
        status: 'healthy'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking system health', error: error.message });
  }
};
