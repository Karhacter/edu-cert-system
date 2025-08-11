const { ethers } = require("ethers");
const axios = require('axios');
const FormData = require('form-data');
const Certificate = require('../models/certificate');
const contractABI = require('../artifacts/contracts/CertificateValidation.sol/CertificateValidation.json').abi;

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
    formData.append('file', fileBuffer, {
      filename: fileName
    });
    
    // Add pinata metadata
    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append('pinataMetadata', metadata);
    
    // Add pinata options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);
    
    // Make the API request to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataApiSecret
        }
      }
    );
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

// Issue a new certificate
exports.issueCertificate = async (req, res) => {
  try {
    const { studentName, courseName, issueDate, additionalInfo } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required' });
    }
    
    // Upload certificate file to IPFS via Pinata
    const fileBuffer = req.file.buffer;
    const ipfsHash = await uploadToIPFS(fileBuffer, req.file.originalname);

    // Issue certificate on blockchain
    const tx = await contract.issueCertificate(studentName, courseName, ipfsHash);
    const receipt = await tx.wait();
    
    // Get certificate ID from event
    const event = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(e => e && e.name === 'CertificateIssued');
      
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
      additionalInfo: additionalInfo || null
    });
    console.log(certificate)
    await certificate.save();
    
    res.status(201).json({
      certificateId,
      studentName,
      courseName,
      ipfsHash: ipfsHash,
      txHash: receipt.hash
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ message: 'Error issuing certificate', error: error.message });
  }
};

// Verify a certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Verify certificate on blockchain
    const result = await contract.verifyCertificate(certificateId);
    console.log(result)
    
    if (!result || !result[0]) {
      return res.status(404).json({ message: 'Certificate not found or invalid' });
    }
    
    res.status(200).json({
      isValid: result[0],
      studentName: result[1],
      courseName: result[2],
      issueDate: new Date(Number(result[3]) * 1000).toISOString(),
      ipfsHash: result[4],
      issuer: result[5]
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: 'Error verifying certificate', error: error.message });
  }
};

// Revoke a certificate
exports.revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Revoke certificate on blockchain
    const tx = await contract.revokeCertificate(certificateId);
    const receipt = await tx.wait();
    
    // Update certificate in database
    await Certificate.findOneAndUpdate(
      { certificateId },
      { isValid: false }
    );
    
    res.status(200).json({
      certificateId,
      revoked: true,
      txHash: receipt.hash
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({ message: 'Error revoking certificate', error: error.message });
  }
};

// Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
};