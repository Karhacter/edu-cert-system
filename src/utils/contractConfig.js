// Contract configuration for frontend
// This file should be updated with the actual deployed contract addresses

// Local development addresses (update these after deployment)
export const CONTRACT_ADDRESSES = {
  ADMIN: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Update this after deployment
  CERTIFICATE_VALIDATION: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  EMPLOYEE: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  ORGANIZATION_ENDORSER: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  SKILLS: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
};

// Helper function to get the correct contract address based on network
export const getContractAddress = (contractName, network = 'localhost') => {
  const addresses = {
    localhost: CONTRACT_ADDRESSES,
    // Add other networks here as needed
  };
  
  return addresses[network]?.[contractName] || CONTRACT_ADDRESSES[contractName];
};

// Update this function to use the correct address
export const updateContractAddress = (contractName, address) => {
  CONTRACT_ADDRESSES[contractName] = address;
  console.log(`Updated ${contractName} address to: ${address}`);
};
