require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/a687259327f74ee1a25933d6a6b4bc41",
      accounts: [
        "592b6ee7b393c79d984c2c71cff4a17c0e462a80e5d94b0717eddac7f0943468",
      ],
    },
  },
};
