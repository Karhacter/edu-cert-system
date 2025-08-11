const { ethers } = require("ethers");
const Admin = require('../models/admin');
const contractABI = require('../artifacts/contracts/Admin.sol/Admin.json').abi;

// Configure Ethereum provider
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.ADMIN_CONTRACT_ADDRESS,
  contractABI,
  wallet
);

// Register a new user (Employee or Organization)
exports.registerUser = async (req, res) => {
  try {
    const { ethAddress, name, location, description, role } = req.body;

    if (!ethAddress || !name || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (role !== 1 && role !== 2) {
      return res.status(400).json({ message: 'Invalid role. Use 1 for Employee, 2 for Organization' });
    }

    // Register user on blockchain
    const tx = await contract.registerUser(ethAddress, name, location, description, role);
    const receipt = await tx.wait();

    // Store registration in database
    const registration = new Admin({
      ethAddress,
      name,
      location,
      description,
      role: role === 1 ? 'Employee' : 'Organization',
      txHash: receipt.hash,
      registeredAt: new Date()
    });

    await registration.save();

    res.status(201).json({
      message: 'User registered successfully',
      ethAddress,
      role: role === 1 ? 'Employee' : 'Organization',
      txHash: receipt.hash
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Check if address is an employee
exports.isEmployee = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const result = await contract.isEmployee(address);
    
    res.status(200).json({
      address,
      isEmployee: result
    });
  } catch (error) {
    console.error('Error checking employee status:', error);
    res.status(500).json({ message: 'Error checking employee status', error: error.message });
  }
};

// Check if address is an organization endorser
exports.isOrganizationEndorser = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const result = await contract.isOrganizationEndorser(address);
    
    res.status(200).json({
      address,
      isOrganizationEndorser: result
    });
  } catch (error) {
    console.error('Error checking organization status:', error);
    res.status(500).json({ message: 'Error checking organization status', error: error.message });
  }
};

// Get all registered employees
exports.getAllEmployees = async (req, res) => {
  try {
    const count = await contract.employeeCount();
    const employees = [];

    for (let i = 0; i < count; i++) {
      const employeeAddress = await contract.registeredEmployees(i);
      const contractAddress = await contract.getEmployeeContractByIndex(i);
      
      employees.push({
        address: employeeAddress,
        contractAddress: contractAddress
      });
    }

    res.status(200).json({
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// Get all registered organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const count = await contract.OrganizationEndorserCount();
    const organizations = [];

    for (let i = 0; i < count; i++) {
      const orgAddress = await contract.registeredOrganization(i);
      const contractAddress = await contract.getOrganizationContractByIndex(i);
      
      organizations.push({
        address: orgAddress,
        contractAddress: contractAddress
      });
    }

    res.status(200).json({
      count: organizations.length,
      organizations
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
};

// Get user registration details from database
exports.getUserRegistration = async (req, res) => {
  try {
    const { address } = req.params;

    const registration = await Admin.findOne({ ethAddress: address });
    
    if (!registration) {
      return res.status(404).json({ message: 'User not found in registration records' });
    }

    res.status(200).json(registration);
  } catch (error) {
    console.error('Error fetching user registration:', error);
    res.status(500).json({ message: 'Error fetching user registration', error: error.message });
  }
};
