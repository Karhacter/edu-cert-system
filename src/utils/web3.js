import { ethers } from "ethers";

// Import ABI
import CertificateValidation from "../../contracts/CertificateValidation.json";

// Contract address - should be updated after deployment
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x1B120b1358a0ffa78DA35e4a32b0dd5404aaC1fA";

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
    if (
      !CONTRACT_ADDRESS ||
      CONTRACT_ADDRESS === "0x1B120b1358a0ffa78DA35e4a32b0dd5404aaC1fA"
    ) {
      throw new Error(
        "Contract address not configured. Please set VITE_CONTRACT_ADDRESS environment variable."
      );
    }

    console.log("Attempting to revoke certificate:", certificateId);
    console.log("Contract address:", CONTRACT_ADDRESS);

    const contract = await getContract(true);

    // Check if the certificate exists and is valid first
    console.log("Checking certificate validity on blockchain...");
    const certificate = await contract.verifyCertificate(certificateId);
    console.log("Blockchain certificate data:", certificate);

    if (!certificate[0]) {
      console.log("Certificate is not valid on blockchain. Details:", {
        isValid: certificate[0],
        studentName: certificate[1],
        courseName: certificate[2],
        issueDate: certificate[3],
        ipfsHash: certificate[4],
        issuer: certificate[5],
      });
      throw new Error("Certificate not found or already revoked");
    }

    // Check if the current user is the issuer or owner
    const signer = await contract.signer;
    const currentAddress = await signer.getAddress();
    const issuer = certificate[5];
    const owner = await contract.owner();

    console.log("Permission check:", {
      currentAddress,
      issuer,
      owner,
      canRevoke: currentAddress === issuer || currentAddress === owner,
    });

    if (currentAddress !== issuer && currentAddress !== owner) {
      throw new Error(
        "Only the certificate issuer or contract owner can revoke this certificate"
      );
    }

    console.log("Proceeding with revocation...");
    const tx = await contract.revokeCertificate(certificateId);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.hash);

    return {
      revoked: true,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error revoking certificate:", error);

    // Provide more specific error messages
    if (error.message.includes("Only issuer or owner can revoke")) {
      throw new Error(
        "You don't have permission to revoke this certificate. Only the issuer or contract owner can revoke it."
      );
    } else if (error.message.includes("Certificate is already revoked")) {
      throw new Error("This certificate is already revoked.");
    } else if (error.message.includes("Contract address not configured")) {
      throw new Error(
        "Smart contract not configured. Please contact the administrator."
      );
    } else if (error.message.includes("User rejected")) {
      throw new Error("Transaction was rejected by the user.");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient funds to pay for gas fees.");
    } else if (error.message.includes("Certificate not found")) {
      throw new Error(
        "Certificate not found on blockchain. It may have been deleted or never properly issued."
      );
    } else {
      throw new Error(`Failed to revoke certificate: ${error.message}`);
    }
  }
};
