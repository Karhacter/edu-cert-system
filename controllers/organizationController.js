const { ethers } = require("ethers");
const Organization = require('../models/organization');
const contractABI = require('../artifacts/contracts/OrganizationEndorser.sol/OrganizationEndorser.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Organization-specific operations
exports.getOrganizationDetails = async (req, res) => {
  try {
    const { address } = req.params;
    const contract = new ethers.Contract(address, contractABI, provider);
    
    const details = await contract.getOrganizationDetails();
    
    res.status(200).json({
      owner: details[0],
      ethAddress: details[1],
      name: details[2],
      location: details[3],
      description: details[4],
      isActive: details[5]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization details', error: error.message });
  }
};

exports.updateOrganizationProfile = async (req, res) => {
  try {
    const { address } = req.params;
    const { name, location, description } = req.body;
    
    const contract = new ethers.Contract(address, contractABI, wallet);
    const tx = await contract.updateProfile(name, location, description);
    const receipt = await tx.wait();
    
    res.status(200).json({
      message: 'Organization profile updated successfully',
      txHash: receipt.hash
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization profile', error: error.message });
  }
};

exports.getOrganizationCertificates = async (req, res) => {
  try {
    const { address } = req.params;
    const certificates = await Organization.find({ organizationAddress: address });
    
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization certificates', error: error.message });
  }
};

exports.endorseCertificate = async (req, res) => {
  try {
    const { address } = req.params;
    const { certificateId, endorsementDetails } = req.body;
    
    const contract = new ethers.Contract(address, contractABI, wallet);
    const tx = await contract.endorseCertificate(certificateId, endorsementDetails);
    const receipt = await tx.wait();
    
    res.status(200).json({
      message: 'Certificate endorsed successfully',
      txHash: receipt.hash
    });
  } catch (error) {
    res.status(500).json({ message: 'Error endorsing certificate', error: error.message });
  }
};
