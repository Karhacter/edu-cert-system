const { ethers } = require("ethers");
const Employee = require("../models/employee");
const employeeContractABI =
  require("../artifacts/contracts/Employee.sol/Employee.json").abi;
const adminContractABI =
  require("../artifacts/contracts/Admin.sol/Admin.json").abi;
const axios = require("axios");

const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:5000/api";
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Admin contract address - should be updated after deployment
const ADMIN_CONTRACT_ADDRESS = process.env.ADMIN_CONTRACT_ADDRESS;

// Employee-specific operations
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ADMIN_CONTRACT_ADDRESS) {
      return res.status(500).json({
        message: "Admin contract address not configured",
        error: "Please set ADMIN_CONTRACT_ADDRESS environment variable",
      });
    }

    // Get the Admin contract instance
    const adminContract = new ethers.Contract(ADMIN_CONTRACT_ADDRESS, adminContractABI, provider);
    
    // Get the actual Employee contract address for this employee
    const employeeContractAddress = await adminContract.getEmployeeContractByAddress(address);
    
    if (employeeContractAddress === ethers.ZeroAddress) {
      return res.status(404).json({
        message: "Employee not found or not registered",
        employeeAddress: address,
      });
    }

    // Get the Employee contract instance
    const employeeContract = new ethers.Contract(employeeContractAddress, employeeContractABI, provider);
    const details = await employeeContract.getEmployeeInfo();

    res.status(200).json({
      ethAddress: details[0],
      name: details[1],
      location: details[2],
      description: details[3],
      endorseCount: details[5],
      isActive: true, // Default to active since Employee contract doesn't have this field
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({
      message: "Error fetching employee details",
      error: error.message,
      details: "Please ensure the Admin contract is properly deployed and the address is configured",
    });
  }
};

exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { address } = req.params;
    const { name, location, description } = req.body;

    // Get the Admin contract instance
    const adminContract = new ethers.Contract(ADMIN_CONTRACT_ADDRESS, adminContractABI, provider);
    
    // Get the actual Employee contract address for this employee
    const employeeContractAddress = await adminContract.getEmployeeContractByAddress(address);
    
    if (employeeContractAddress === ethers.ZeroAddress) {
      return res.status(404).json({
        message: "Employee not found or not registered",
      });
    }

    // Get the Employee contract instance
    const employeeContract = new ethers.Contract(employeeContractAddress, employeeContractABI, wallet);
    const tx = await employeeContract.editInfo(name, description, location);
    const receipt = await tx.wait();

    res.status(200).json({
      message: "Employee profile updated successfully",
      txHash: receipt.hash,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating employee profile",
      error: error.message,
    });
  }
};

exports.getEmployeeCertificates = async (req, res) => {
  try {
    const { address } = req.params;
    const certificates = await Employee.find({ employeeAddress: address });

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employee certificates",
      error: error.message,
    });
  }
};

// User-facing API utilities for employee and organization actions

// Employee API functions
exports.getEmployeeDetailsAPI = async (address) => {
  const response = await axios.get(`${API_BASE_URL}/employees/${address}`);
  return response.data;
};

exports.updateEmployeeProfileAPI = async (address, profileData) => {
  const response = await axios.put(
    `${API_BASE_URL}/employees/${address}`,
    profileData
  );
  return response.data;
};

exports.getEmployeeCertificatesAPI = async (address) => {
  const response = await axios.get(
    `${API_BASE_URL}/employees/${address}/certificates`
  );
  return response.data;
};

// Organization API functions
exports.getOrganizationDetailsAPI = async (address) => {
  const response = await axios.get(`${API_BASE_URL}/organizations/${address}`);
  return response.data;
};

exports.updateOrganizationProfileAPI = async (address, profileData) => {
  const response = await axios.put(
    `${API_BASE_URL}/organizations/${address}`,
    profileData
  );
  return response.data;
};

exports.getOrganizationCertificatesAPI = async (address) => {
  const response = await axios.get(
    `${API_BASE_URL}/organizations/${address}/certificates`
  );
  return response.data;
};

exports.endorseCertificateAPI = async (address, endorseData) => {
  const response = await axios.post(
    `${API_BASE_URL}/organizations/${address}/endorse`,
    endorseData
  );
  return response.data;
};

// Additional utility functions
exports.checkIsEmployeeAPI = async (address) => {
  const response = await axios.get(
    `${API_BASE_URL}/employees/${address}/verify`
  );
  return response.data;
};

exports.checkIsOrganizationAPI = async (address) => {
  const response = await axios.get(
    `${API_BASE_URL}/organizations/${address}/verify`
  );
  return response.data;
};
