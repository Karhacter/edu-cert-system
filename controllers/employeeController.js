const { ethers } = require("ethers");
const Employee = require('../models/employee');
const contractABI = require('../artifacts/contracts/Employee.sol/Employee.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Employee-specific operations
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { address } = req.params;
    const contract = new ethers.Contract(address, contractABI, provider);
    
    const details = await contract.getEmployeeDetails();
    
    res.status(200).json({
      owner: details[0],
      ethAddress: details[1],
      name: details[2],
      location: details[3],
      description: details[4],
      isActive: details[5]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee details', error: error.message });
  }
};

exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { address } = req.params;
    const { name, location, description } = req.body;
    
    const contract = new ethers.Contract(address, contractABI, wallet);
    const tx = await contract.updateProfile(name, location, description);
    const receipt = await tx.wait();
    
    res.status(200).json({
      message: 'Employee profile updated successfully',
      txHash: receipt.hash
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee profile', error: error.message });
  }
};

exports.getEmployeeCertificates = async (req, res) => {
  try {
    const { address } = req.params;
    const certificates = await Employee.find({ employeeAddress: address });
    
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee certificates', error: error.message });
  }
};
