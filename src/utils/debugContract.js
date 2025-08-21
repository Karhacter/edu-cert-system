import { ethers } from "ethers";
import AdminABI from "../../contracts/Admin.json";

// Debug configuration
const DEBUG_CONFIG = {
  // Try different networks
  networks: {
    localhost: "http://localhost:8545",
    hardhat: "http://127.0.0.1:8545",
    ganache: "http://127.0.0.1:7545",
  },
  // Try different contract addresses
  contractAddresses: [
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Default
  ],
};

export const debugContractConnection = async () => {
  const results = [];

  // Check if MetaMask is available
  if (!window.ethereum) {
    return {
      error: "MetaMask not found",
      suggestion: "Please install MetaMask extension",
    };
  }

  // Get current network
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log("Current network:", network);

    results.push({
      type: "network",
      chainId: network.chainId.toString(),
      name: network.name,
    });
  } catch (error) {
    results.push({
      type: "network_error",
      error: error.message,
    });
  }

  // Test contract addresses
  for (const address of DEBUG_CONFIG.contractAddresses) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(address, AdminABI.abi, provider);

      // Test basic contract functions
      const [owner, employeeCount] = await Promise.all([
        contract.owner(),
        contract.employeeCount(),
      ]);

      results.push({
        type: "contract_found",
        address,
        owner,
        employeeCount: employeeCount.toString(),
      });

      // Test isEmployee with zero address
      const isEmployee = await contract.isEmployee(
        "0x6f652d2eb3449092C4ac9ecB08bB0bD86DbFd7b8"
      );
      results.push({
        type: "isEmployee_test",
        address,
        zeroAddressResult: isEmployee,
      });
    } catch (error) {
      results.push({
        type: "contract_error",
        address,
        error: error.message,
      });
    }
  }

  return results;
};

// Enhanced contract connection with better error handling
export const getAdminContractEnhanced = async (withSigner = false) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Get network info
    const network = await provider.getNetwork();
    console.log("Connected to network:", {
      chainId: network.chainId.toString(),
      name: network.name,
    });

    // Try to get the correct contract address
    let contractAddress = import.meta.env.VITE_ADMIN_CONTRACT_ADDRESS;

    if (!contractAddress) {
      // Try to detect deployed contracts
      console.warn("No contract address in env, trying common addresses...");

      // For development, use common Hardhat addresses
      const commonAddresses = [
        "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat #1
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Hardhat #2
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Hardhat #3
      ];

      for (const addr of commonAddresses) {
        try {
          const testContract = new ethers.Contract(
            addr,
            AdminABI.abi,
            provider
          );
          await testContract.owner(); // Test if contract exists
          contractAddress = addr;
          console.log("✅ Found contract at:", addr);
          break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!contractAddress) {
      throw new Error(
        "Could not find deployed Admin contract. Please deploy contracts first."
      );
    }

    const signer = withSigner ? await provider.getSigner() : provider;
    const contract = new ethers.Contract(contractAddress, AdminABI.abi, signer);

    // Verify contract has required functions
    const requiredFunctions = ["isEmployee", "registerUser", "owner"];
    for (const func of requiredFunctions) {
      if (!contract[func]) {
        throw new Error(`Contract missing required function: ${func}`);
      }
    }

    return contract;
  } catch (error) {
    console.error("Enhanced contract connection error:", error);

    // Provide helpful error messages
    if (error.message.includes("ECONNREFUSED")) {
      throw new Error(
        "Cannot connect to blockchain. Please ensure your local node is running (run 'npx hardhat node' in backend folder)"
      );
    }

    if (error.message.includes("contract missing")) {
      throw new Error(
        "Contract functions not found. Please ensure contracts are deployed and addresses are correct"
      );
    }

    throw error;
  }
};

// Enhanced isEmployee check with better error handling
export const checkIsEmployeeEnhanced = async (address) => {
  try {
    const contract = await getAdminContractEnhanced();

    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid Ethereum address format");
    }

    const isEmployee = await contract.isEmployee(address);
    return isEmployee;
  } catch (error) {
    console.error("Enhanced isEmployee error:", error);

    // Return false for non-existent addresses instead of throwing
    if (error.message.includes("revert") || error.message.includes("invalid")) {
      return false;
    }

    throw error;
  }
};
