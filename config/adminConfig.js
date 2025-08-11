module.exports = {
  // Admin configuration
  admin: {
    // Default admin addresses (can be loaded from environment)
    adminAddresses: process.env.ADMIN_ADDRESSES
      ? process.env.ADMIN_ADDRESSES.split(",")
      : [],

    // Registration settings
    registration: {
      maxEmployees: 1000,
      maxOrganizations: 500,
      requireApproval: false,
    },

    // Rate limiting
    rateLimits: {
      registerUser: { windowMs: 15 * 60 * 1000, max: 10 }, // 15 minutes, 10 requests
      general: { windowMs: 15 * 60 * 1000, max: 100 }, // 15 minutes, 100 requests
    },

    // Validation rules
    validation: {
      minNameLength: 2,
      maxNameLength: 100,
      minDescriptionLength: 0,
      maxDescriptionLength: 500,
    },
  },

  // Contract addresses (to be set in environment)
  contracts: {
    admin: process.env.ADMIN_CONTRACT_ADDRESS,
    certificate: process.env.CONTRACT_ADDRESS,
  },

  // Network settings
  network: {
    name: process.env.NETWORK_NAME || "sepolia",
    rpcUrl: process.env.SEPOLIA_URL,
    chainId: parseInt(process.env.CHAIN_ID) || 11155111,
  },
};
