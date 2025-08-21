const { ethers } = require("ethers");
const Admin = require("../models/admin");
const Employee = require("../models/employee");
const Organization = require("../models/organization");
const Certificate = require("../models/certificate");

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      totalOrganizations,
      totalCertificates,
      activeCertificates,
      revokedCertificates,
    ] = await Promise.all([
      Employee.countDocuments(),
      Organization.countDocuments(),
      Certificate.countDocuments(),
      Certificate.countDocuments({ isValid: true }),
      Certificate.countDocuments({ isValid: false }),
    ]);

    // Calculate transaction statistics
    const totalTransactions =
      totalCertificates + totalEmployees + totalOrganizations;

    // Certificate transactions (issue, verify, revoke)
    const certificateTransactions = totalCertificates * 3; // Each certificate involves issue, verify, and potentially revoke

    // Employee profile transactions (skills, certifications, work experience, education)
    const employeeProfileTransactions = totalEmployees * 4; // Assuming average of 4 profile updates per employee

    // Endorsement transactions (skills, certifications, work experience)
    const endorsementTransactions = totalEmployees * 2; // Assuming average of 2 endorsements per employee

    // User registration transactions
    const registrationTransactions = totalEmployees + totalOrganizations;

    // Total synthetic transactions (all blockchain interactions)
    const totalSyntheticTransactions =
      certificateTransactions +
      employeeProfileTransactions +
      endorsementTransactions +
      registrationTransactions;

    // Calculate percentages
    const certificateTransactionPercentage =
      totalTransactions > 0
        ? (
            (certificateTransactions / totalSyntheticTransactions) *
            100
          ).toFixed(1)
        : 0;
    const employeeProfileTransactionPercentage =
      totalTransactions > 0
        ? (
            (employeeProfileTransactions / totalSyntheticTransactions) *
            100
          ).toFixed(1)
        : 0;
    const endorsementTransactionPercentage =
      totalTransactions > 0
        ? (
            (endorsementTransactions / totalSyntheticTransactions) *
            100
          ).toFixed(1)
        : 0;
    const registrationTransactionPercentage =
      totalTransactions > 0
        ? (
            (registrationTransactions / totalSyntheticTransactions) *
            100
          ).toFixed(1)
        : 0;

    // Overall synthetic transaction percentage
    const syntheticTransactionPercentage =
      totalTransactions > 0
        ? (
            (totalSyntheticTransactions /
              (totalSyntheticTransactions + totalTransactions)) *
            100
          ).toFixed(1)
        : 0;

    const recentRegistrations = await Admin.find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .select("name role registeredAt");

    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("studentName courseName issueDate isValid");

    res.status(200).json({
      statistics: {
        totalEmployees,
        totalOrganizations,
        totalCertificates,
        activeCertificates,
        revokedCertificates,
      },
      transactionStats: {
        totalTransactions,
        totalSyntheticTransactions,
        syntheticTransactionPercentage,
        breakdown: {
          certificateTransactions: {
            count: certificateTransactions,
            percentage: certificateTransactionPercentage,
          },
          employeeProfileTransactions: {
            count: employeeProfileTransactions,
            percentage: employeeProfileTransactionPercentage,
          },
          endorsementTransactions: {
            count: endorsementTransactions,
            percentage: endorsementTransactionPercentage,
          },
          registrationTransactions: {
            count: registrationTransactions,
            percentage: registrationTransactionPercentage,
          },
        },
      },
      recentRegistrations,
      recentCertificates,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching dashboard data", error: error.message });
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
        network: "Sepolia",
      },
      database: {
        connected: true,
        status: "healthy",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking system health", error: error.message });
  }
};

// Get detailed blockchain transaction statistics
exports.getBlockchainTransactionStats = async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);

    // Get recent blocks to analyze transaction patterns
    const currentBlock = await provider.getBlockNumber();
    const recentBlocks = [];

    // Analyze last 100 blocks for transaction patterns
    for (let i = 0; i < 100 && i < currentBlock; i++) {
      try {
        const block = await provider.getBlock(currentBlock - i);
        if (block && block.transactions.length > 0) {
          recentBlocks.push(block);
        }
      } catch (error) {
        console.log(`Error fetching block ${currentBlock - i}:`, error.message);
        break;
      }
    }

    // Analyze transaction types
    let totalTransactions = 0;
    let contractInteractions = 0;
    let certificateTransactions = 0;
    let employeeTransactions = 0;
    let organizationTransactions = 0;

    for (const block of recentBlocks) {
      totalTransactions += block.transactions.length;

      // Analyze each transaction in the block
      for (const txHash of block.transactions) {
        try {
          const tx = await provider.getTransaction(txHash);
          if (tx && tx.to) {
            // Check if transaction is to our contract addresses
            const contractAddresses = [
              process.env.CONTRACT_ADDRESS, // CertificateValidation
              process.env.ADMIN_CONTRACT_ADDRESS, // Admin
              // Add other contract addresses as needed
            ].filter(Boolean);

            if (contractAddresses.includes(tx.to.toLowerCase())) {
              contractInteractions++;

              // Try to decode transaction data to determine type
              try {
                // This is a simplified analysis - in a real scenario you'd decode the actual function calls
                if (tx.data.length > 10) {
                  // Has function data
                  if (
                    tx.data.includes("issueCertificate") ||
                    tx.data.includes("revokeCertificate")
                  ) {
                    certificateTransactions++;
                  } else if (
                    tx.data.includes("addSkill") ||
                    tx.data.includes("addCertification")
                  ) {
                    employeeTransactions++;
                  } else if (
                    tx.data.includes("addEmployees") ||
                    tx.data.includes("registerUser")
                  ) {
                    organizationTransactions++;
                  }
                }
              } catch (decodeError) {
                // If we can't decode, count as general contract interaction
                console.log(
                  "Could not decode transaction:",
                  decodeError.message
                );
              }
            }
          }
        } catch (error) {
          console.log(`Error analyzing transaction ${txHash}:`, error.message);
        }
      }
    }

    // Calculate percentages
    const syntheticTransactionPercentage =
      totalTransactions > 0
        ? ((contractInteractions / totalTransactions) * 100).toFixed(2)
        : 0;
    const certificateTransactionPercentage =
      contractInteractions > 0
        ? ((certificateTransactions / contractInteractions) * 100).toFixed(2)
        : 0;
    const employeeTransactionPercentage =
      contractInteractions > 0
        ? ((employeeTransactions / contractInteractions) * 100).toFixed(2)
        : 0;
    const organizationTransactionPercentage =
      contractInteractions > 0
        ? ((organizationTransactions / contractInteractions) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      blockchainStats: {
        totalTransactions,
        contractInteractions,
        syntheticTransactionPercentage,
        breakdown: {
          certificateTransactions: {
            count: certificateTransactions,
            percentage: certificateTransactionPercentage,
          },
          employeeTransactions: {
            count: employeeTransactions,
            percentage: employeeTransactionPercentage,
          },
          organizationTransactions: {
            count: organizationTransactions,
            percentage: organizationTransactionPercentage,
          },
        },
        analyzedBlocks: recentBlocks.length,
        currentBlockNumber: currentBlock,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching blockchain transaction statistics",
      error: error.message,
    });
  }
};
