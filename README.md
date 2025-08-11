# Blockchain-based Academic Certificate Issuance System

This project is a decentralized application (DApp) that manages the issuance and verification of academic certificates using blockchain technology. It aims to enhance transparency, prevent forgery, and streamline the verification process for educational institutions and employers.

## 🌟 Features

- ✅ Issue academic certificates on the blockchain
- 🔐 Tamper-proof and verifiable records
- 🧑‍🎓 Student-owned credentials
- 🏫 Admin panel for institutions to manage certificate issuance
- 🌍 Public certificate verification portal

## 🏗️ Tech Stack

- **Smart Contracts**: Solidity (Ethereum / EVM-compatible chain)
- **Frontend**: React.js / Next.js
- **Backend**: Node.js / Express (optional, for off-chain support)
- **Blockchain**: Ethereum / Polygon / BNB Chain (testnet or mainnet)
- **Storage**: IPFS / Filecoin (for storing certificate metadata or PDF)

## 📂 Project Structure

blockchain-certificate-system/
├── contracts/ # Solidity smart contracts
├── frontend/ # React/Next.js frontend
├── scripts/ # Deployment and interaction scripts
├── test/ # Smart contract tests
├── backend/ # Optional backend server (Express.js)
└── README.md

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- Hardhat (or Truffle)
- MetaMask or other Web3 wallet
- Ganache or access to a testnet

### Installation

```bash
git clone https://github.com/your-username/blockchain-certificate-system.git
cd blockchain-certificate-system
npm install

Smart Contract Deployment

cd contracts
npx hardhat compile
npx hardhat deploy --network <network-name>

Run Frontend

cd frontend
npm install
npm run dev

📄 Smart Contract Overview

    CertificateRegistry.sol: Main contract that handles certificate issuance and lookup.

    Ownable: Access control to restrict issuing certificates to institutions only.

📸 Screenshots

(Add screenshots of the UI: certificate viewer, issuing form, verification page, etc.)
📜 License

This project is licensed under the MIT License. See the LICENSE file for more information.
🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork the repository and submit a pull request.
🧠 Ideas for Improvement

    NFT-based certificates (ERC-721)

    Decentralized identity (DID) integration

    Support for multiple institutions

    Multilingual support

    Audit logging
```

## Project For subject name: "Chuyên Đề Thực Tập" - "Cao Đẳng Công Thương"
