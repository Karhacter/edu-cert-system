import { ethers } from "ethers";

// Import ABI
import CertificateValidation from "../../contracts/CertificateValidation.json";

// Contract address - should be updated after deployment
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "0xYourContractAddressHere";

// Connect to wallet
export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error(
        "No Ethereum wallet found. Please install MetaMask or another wallet."
      );
    }

    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Create ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Disconnect wallet
export const disconnectWallet = async () => {
  try {
    // Note: MetaMask doesn't have a direct "disconnect" method in their API
    // The best we can do is clear our app's state
    // The actual connection to MetaMask remains until the user disconnects from their MetaMask extension

    // We can return a success message to confirm the action in our UI
    return { success: true, message: "Wallet disconnected from application" };
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    throw error;
  }
};

// Get contract instance
export const getContract = async (withSigner = false) => {
  try {
    const { provider, signer } = await connectWallet();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CertificateValidation.abi,
      withSigner ? signer : provider
    );

    return contract;
  } catch (error) {
    console.error("Error getting contract:", error);
    throw error;
  }
};

// Issue a certificate
export const issueCertificate = async (studentName, courseName, ipfsHash) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.issueCertificate(
      studentName,
      courseName,
      ipfsHash
    );
    const receipt = await tx.wait();

    // Find certificate ID from event
    const event = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
        } catch (e) {
          return null;
        }
      })
      .find((e) => e && e.name === "CertificateIssued");

    return {
      certificateId: event.args[0],
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throw error;
  }
};

// Verify a certificate
export const verifyCertificate = async (certificateId) => {
  try {
    const contract = await getContract();
    const result = await contract.verifyCertificate(certificateId);

    return {
      isValid: result[0],
      studentName: result[1],
      courseName: result[2],
      issueDate: new Date(Number(result[3]) * 1000).toISOString(),
      ipfsHash: result[4],
      issuer: result[5],
    };
  } catch (error) {
    console.error("Error verifying certificate:", error);
    throw error;
  }
};

// Revoke a certificate
export const revokeCertificate = async (certificateId) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.revokeCertificate(certificateId);
    const receipt = await tx.wait();

    return {
      revoked: true,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error revoking certificate:", error);
    throw error;
  }
};
