import { ethers } from "ethers";
import AdminABI from "../../contracts/Admin.json";
import { getContractAddress } from "./contractConfig";

const ADMIN_CONTRACT_ADDRESS = getContractAddress("ADMIN");

// Get Admin contract instance
export const getAdminContract = async (withSigner = false) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ADMIN_CONTRACT_ADDRESS,
      AdminABI.abi,
      withSigner ? signer : provider
    );

    return contract;
  } catch (error) {
    console.error("Error getting admin contract:", error);
    throw error;
  }
};

// Register employee directly via MetaMask
export const registerEmployeeOnChain = async (employeeData) => {
  try {
    const { ethAddress, name, location, description } = employeeData;

    const contract = await getAdminContract(true);

    // Estimate gas
    const gasEstimate = await contract.registerUser.estimateGas(
      ethAddress,
      name,
      location,
      description,
      1 // Role 1 = Employee
    );

    // Send transaction
    const tx = await contract.registerUser(
      ethAddress,
      name,
      location,
      description,
      1,
      {
        gasLimit: (gasEstimate * 12n) / 10n, // Add 20% buffer
      }
    );

    return {
      txHash: tx.hash,
      transaction: tx,
    };
  } catch (error) {
    console.error("Error registering employee:", error);
    throw error;
  }
};

// Check if address is already registered as employee
export const checkIsEmployee = async (address) => {
  try {
    const contract = await getAdminContract();
    const isEmployee = await contract.isEmployee(address);
    return isEmployee;
  } catch (error) {
    console.error("Error checking employee status:", error);
    throw error;
  }
};

// Get transaction receipt
export const getTransactionReceipt = async (txHash) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error("Error getting transaction receipt:", error);
    throw error;
  }
};
