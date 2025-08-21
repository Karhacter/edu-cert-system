const { ethers } = require("ethers");
const axios = require("axios");
const FormData = require("form-data");
const Certificate = require("../models/certificate");
const contractABI =
  require("../artifacts/contracts/CertificateValidation.sol/CertificateValidation.json").abi;

// Configure Pinata client
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;

// Configure Ethereum provider
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

// Upload file to IPFS via Pinata
const uploadToIPFS = async (fileBuffer, fileName) => {
  try {
    const formData = new FormData();

    // Add the file to the formData
    formData.append("file", fileBuffer, {
      filename: fileName,
    });

    // Add pinata metadata
    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append("pinataMetadata", metadata);

    // Add pinata options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    // Make the API request to Pinata
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

// Issue a new certificate
exports.issueCertificate = async (req, res) => {
  try {
    const { studentName, courseName, issueDate, additionalInfo } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Certificate file is required" });
    }

    // Upload certificate file to IPFS via Pinata
    const fileBuffer = req.file.buffer;
    const ipfsHash = await uploadToIPFS(fileBuffer, req.file.originalname);

    // Issue certificate on blockchain
    const tx = await contract.issueCertificate(
      studentName,
      courseName,
      ipfsHash
    );
    const receipt = await tx.wait();

    // Get certificate ID from event
    const event = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find((e) => e && e.name === "CertificateIssued");

    const certificateId = event.args[0];

    // Store certificate in database
    const certificate = new Certificate({
      certificateId: certificateId,
      studentName,
      courseName,
      issueDate,
      ipfsHash: ipfsHash,
      isValid: true,
      txHash: receipt.hash,
      additionalInfo: additionalInfo || null,
    });
    console.log(certificate);
    await certificate.save();

    res.status(201).json({
      certificateId,
      studentName,
      courseName,
      ipfsHash: ipfsHash,
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    res
      .status(500)
      .json({ message: "Error issuing certificate", error: error.message });
  }
};

// Verify a certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Verify certificate on blockchain
    const result = await contract.verifyCertificate(certificateId);
    console.log(result);

    if (!result || !result[0]) {
      return res
        .status(404)
        .json({ message: "Certificate not found or invalid" });
    }

    res.status(200).json({
      isValid: result[0],
      studentName: result[1],
      courseName: result[2],
      issueDate: new Date(Number(result[3]) * 1000).toISOString(),
      ipfsHash: result[4],
      issuer: result[5],
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res
      .status(500)
      .json({ message: "Error verifying certificate", error: error.message });
  }
};

// Revoke a certificate
exports.revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    console.log(`Attempting to revoke certificate: ${certificateId}`);

    // First check if certificate exists in database
    const existingCertificate = await Certificate.findOne({ certificateId });
    if (!existingCertificate) {
      console.log(`Certificate not found in database: ${certificateId}`);
      return res
        .status(404)
        .json({ message: "Certificate not found in database" });
    }

    console.log(
      `Certificate found in database. Current isValid status: ${existingCertificate.isValid}`
    );

    if (!existingCertificate.isValid) {
      console.log(`Certificate ${certificateId} is already revoked`);
      return res
        .status(400)
        .json({ message: "Certificate is already revoked" });
    }

    // Revoke certificate on blockchain
    console.log(`Revoking certificate ${certificateId} on blockchain...`);
    const tx = await contract.revokeCertificate(certificateId);
    console.log(`Blockchain transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `Blockchain transaction confirmed in block: ${receipt.blockNumber}`
    );

    // Update certificate in database
    console.log(`Updating database for certificate ${certificateId}...`);
    const updateResult = await Certificate.findOneAndUpdate(
      { certificateId },
      { isValid: false },
      { new: true } // Return the updated document
    );

    if (!updateResult) {
      console.error(
        `Failed to update database for certificate ${certificateId}`
      );
      return res
        .status(500)
        .json({
          message: "Failed to update database after blockchain revocation",
        });
    }

    console.log(
      `Database updated successfully. New isValid status: ${updateResult.isValid}`
    );

    // Verify the update worked
    const verificationCheck = await Certificate.findOne({ certificateId });
    console.log(
      `Verification check - isValid status: ${verificationCheck.isValid}`
    );

    res.status(200).json({
      certificateId,
      revoked: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      databaseUpdated: true,
      previousStatus: existingCertificate.isValid,
      newStatus: updateResult.isValid,
    });
  } catch (error) {
    console.error("Error revoking certificate:", error);

    // Check if it's a blockchain error
    if (error.message.includes("Only issuer or owner can revoke")) {
      return res.status(403).json({
        message:
          "Permission denied: Only the certificate issuer or contract owner can revoke certificates",
      });
    }

    if (error.message.includes("Certificate is already revoked")) {
      return res.status(400).json({
        message: "Certificate is already revoked on the blockchain",
      });
    }

    res.status(500).json({
      message: "Error revoking certificate",
      error: error.message,
      details: "Check server logs for more information",
    });
  }
};

// Sync database with blockchain state
exports.syncCertificateStatus = async (req, res) => {
  try {
    const { certificateId } = req.params;

    console.log(
      `Syncing certificate ${certificateId} with blockchain state...`
    );

    // Get certificate from database
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res
        .status(404)
        .json({ message: "Certificate not found in database" });
    }

    // Check blockchain state
    const blockchainResult = await contract.verifyCertificate(certificateId);
    const blockchainIsValid = blockchainResult[0];

    console.log(
      `Database isValid: ${certificate.isValid}, Blockchain isValid: ${blockchainIsValid}`
    );

    // Update database if there's a mismatch
    if (certificate.isValid !== blockchainIsValid) {
      console.log(
        `Mismatch detected! Updating database to match blockchain...`
      );

      const updateResult = await Certificate.findOneAndUpdate(
        { certificateId },
        { isValid: blockchainIsValid },
        { new: true }
      );

      console.log(
        `Database updated. New isValid status: ${updateResult.isValid}`
      );

      res.status(200).json({
        certificateId,
        synced: true,
        previousDatabaseStatus: certificate.isValid,
        blockchainStatus: blockchainIsValid,
        newDatabaseStatus: updateResult.isValid,
        message: "Database synced with blockchain state",
      });
    } else {
      res.status(200).json({
        certificateId,
        synced: false,
        message: "Database already in sync with blockchain",
        databaseStatus: certificate.isValid,
        blockchainStatus: blockchainIsValid,
      });
    }
  } catch (error) {
    console.error("Error syncing certificate status:", error);
    res.status(500).json({
      message: "Error syncing certificate status",
      error: error.message,
    });
  }
};

// Sync all certificates with blockchain state
exports.syncAllCertificates = async (req, res) => {
  try {
    console.log("Starting bulk sync of all certificates with blockchain...");

    const certificates = await Certificate.find();
    let syncedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const certificate of certificates) {
      try {
        const blockchainResult = await contract.verifyCertificate(
          certificate.certificateId
        );
        const blockchainIsValid = blockchainResult[0];

        if (certificate.isValid !== blockchainIsValid) {
          await Certificate.findOneAndUpdate(
            { certificateId: certificate.certificateId },
            { isValid: blockchainIsValid }
          );
          syncedCount++;
          results.push({
            certificateId: certificate.certificateId,
            synced: true,
            previousStatus: certificate.isValid,
            newStatus: blockchainIsValid,
          });
        } else {
          results.push({
            certificateId: certificate.certificateId,
            synced: false,
            status: certificate.isValid,
          });
        }
      } catch (error) {
        console.error(
          `Error syncing certificate ${certificate.certificateId}:`,
          error.message
        );
        errorCount++;
        results.push({
          certificateId: certificate.certificateId,
          synced: false,
          error: error.message,
        });
      }
    }

    console.log(
      `Bulk sync completed. Synced: ${syncedCount}, Errors: ${errorCount}`
    );

    res.status(200).json({
      totalCertificates: certificates.length,
      syncedCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error("Error in bulk sync:", error);
    res.status(500).json({
      message: "Error in bulk sync",
      error: error.message,
    });
  }
};

// Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res
      .status(500)
      .json({ message: "Error fetching certificates", error: error.message });
  }
};

// Test function to manually update certificate status (for debugging)
exports.testUpdateCertificate = async (req, res) => {
  try {
    const { certificateId, isValid } = req.body;

    console.log(
      `Testing manual update for certificate ${certificateId} to isValid: ${isValid}`
    );

    // Find the certificate first
    const existingCertificate = await Certificate.findOne({ certificateId });
    if (!existingCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    console.log(
      `Found certificate. Current isValid: ${existingCertificate.isValid}`
    );

    // Update the certificate
    const updateResult = await Certificate.findOneAndUpdate(
      { certificateId },
      { isValid: isValid === "true" || isValid === true },
      { new: true }
    );

    if (!updateResult) {
      return res.status(500).json({ message: "Update failed" });
    }

    console.log(`Update successful. New isValid: ${updateResult.isValid}`);

    // Verify the update
    const verificationCheck = await Certificate.findOne({ certificateId });
    console.log(`Verification check - isValid: ${verificationCheck.isValid}`);

    res.status(200).json({
      certificateId,
      previousStatus: existingCertificate.isValid,
      newStatus: updateResult.isValid,
      verificationStatus: verificationCheck.isValid,
      message: "Test update completed",
    });
  } catch (error) {
    console.error("Error in test update:", error);
    res.status(500).json({
      message: "Error in test update",
      error: error.message,
    });
  }
};
