import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiCheck,
  FiX,
  FiEye,
  FiTrash2,
  FiLink,
  FiLogOut,
  FiRefreshCw,
} from "react-icons/fi";
import * as api from "../../utils/api";
import {
  connectWallet,
  disconnectWallet,
  revokeCertificate,
} from "../../utils/web3";

const ViewCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);

  // Get network information
  const getNetworkInfo = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        let networkName, explorerUrl;

        switch (chainId) {
          case "0x1": // Mainnet
            networkName = "Ethereum Mainnet";
            explorerUrl = "https://etherscan.io";
            break;
          case "0xaa36a7": // Sepolia
            networkName = "Sepolia Testnet";
            explorerUrl = "https://sepolia.etherscan.io";
            break;
          case "0x5": // Goerli
            networkName = "Goerli Testnet";
            explorerUrl = "https://goerli.etherscan.io";
            break;
          default:
            networkName = "Unknown Network";
            explorerUrl = "https://etherscan.io";
        }

        setNetworkInfo({ name: networkName, explorerUrl, chainId });
      } catch (error) {
        console.error("Error getting network info:", error);
      }
    }
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          const { address } = await connectWallet();
          setWalletAddress(address);
          setWalletConnected(true);
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
    getNetworkInfo();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet from MetaMask
          handleDisconnectWallet();
        } else {
          // User switched accounts
          setWalletAddress(accounts[0]);
        }
      });

      // Listen for network changes
      window.ethereum.on("chainChanged", () => {
        getNetworkInfo();
      });
    }

    // Load certificates
    loadCertificates();

    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  // Disconnect wallet
  const handleDisconnectWallet = async () => {
    try {
      setIsDisconnecting(true);
      await disconnectWallet();
      setWalletConnected(false);
      setWalletAddress("");
      toast.success("Wallet disconnected successfully!");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Load certificates
  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllCertificates();
      setCertificates(data);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Failed to load certificates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // View certificate details
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowModal(true);
  };

  // Check certificate status on blockchain
  const checkCertificateStatus = async (certificateId) => {
    try {
      const { verifyCertificate } = await import("../../utils/web3");
      const result = await verifyCertificate(certificateId);
      console.log("Certificate status check:", result);
      return result;
    } catch (error) {
      console.error("Error checking certificate status:", error);
      return null;
    }
  };

  // Revoke certificate
  const handleRevokeCertificate = async (certificateId) => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsRevoking(true);

      // First check the certificate status
      console.log("Checking certificate before revocation:", certificateId);
      const status = await checkCertificateStatus(certificateId);

      if (status && !status.isValid) {
        toast.error("This certificate is already revoked on the blockchain");
        // Refresh certificates to sync with blockchain state
        await loadCertificates();
        return;
      }

      // First try to revoke on blockchain
      const blockchainResult = await revokeCertificate(certificateId);

      if (blockchainResult.revoked) {
        // Then update the backend database
        await api.revokeCertificate(certificateId);

        toast.success("Certificate revoked successfully!");

        // Refresh certificates
        await loadCertificates();

        // Close modal if open
        if (showModal) {
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error revoking certificate:", error);

      // Show specific error message
      let errorMessage = "Failed to revoke certificate. Please try again.";

      if (error.message.includes("don't have permission")) {
        errorMessage = error.message;
      } else if (error.message.includes("already revoked")) {
        errorMessage = error.message;
      } else if (error.message.includes("not configured")) {
        errorMessage = error.message;
      } else if (error.message.includes("rejected")) {
        errorMessage = error.message;
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = error.message;
      } else if (error.message.includes("Certificate not found")) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsRevoking(false);
    }
  };

  // Sync certificate status with blockchain
  const handleSyncCertificate = async (certificateId) => {
    try {
      setIsSyncing(true);
      console.log(`Syncing certificate ${certificateId}...`);

      const result = await api.syncCertificateStatus(certificateId);

      if (result.synced) {
        toast.success(
          `Certificate ${certificateId} synced! Status updated from ${result.previousDatabaseStatus} to ${result.newDatabaseStatus}`
        );
        // Refresh certificates to show updated status
        await loadCertificates();
      } else {
        toast.info(
          `Certificate ${certificateId} already in sync. Database: ${result.databaseStatus}, Blockchain: ${result.blockchainStatus}`
        );
      }
    } catch (error) {
      console.error("Error syncing certificate:", error);
      toast.error(`Failed to sync certificate: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all certificates
  const handleSyncAllCertificates = async () => {
    try {
      setIsSyncing(true);
      console.log("Syncing all certificates...");

      const result = await api.syncAllCertificates();

      toast.success(
        `Sync completed! ${result.syncedCount} certificates updated, ${result.errorCount} errors`
      );

      // Refresh certificates to show updated statuses
      await loadCertificates();
    } catch (error) {
      console.error("Error syncing all certificates:", error);
      toast.error(`Failed to sync certificates: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  // Check if current user can revoke a certificate
  const canRevokeCertificate = (certificate) => {
    if (!walletConnected || !walletAddress) return false;

    // Check if the certificate is valid
    if (!certificate.isValid) return false;

    // Check if the current user is the issuer (this would need to be implemented based on your data structure)
    // For now, we'll show the button and let the blockchain handle the permission check
    return true;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>View Certificates</h1>

        {/* Sync All Button */}
        {walletConnected && (
          <button
            onClick={handleSyncAllCertificates}
            disabled={isSyncing}
            className="btn btn-outline flex items-center"
            title="Sync all certificates with blockchain"
          >
            <FiRefreshCw
              className={`mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync All"}
          </button>
        )}
      </div>

      {/* Wallet Status */}
      <div className="mb-6">
        <div className="card">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Wallet Status</h2>

            {!walletConnected && (
              <button
                onClick={handleConnectWallet}
                className="btn btn-primary text-sm py-1 px-3"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {walletConnected ? (
            <div className="mt-4 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiLink className="text-green-500 mr-2" />
                    <div>
                      <p className="text-green-700 dark:text-green-400 font-medium">
                        Connected Wallet
                      </p>
                      <p className="text-green-600 dark:text-green-500 text-sm mt-1">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectWallet}
                    disabled={isDisconnecting}
                    className="btn btn-outline flex items-center text-[var(--text-secondary)] hover:text-red-500 text-sm py-1"
                  >
                    <FiLogOut className="mr-1" />
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              </div>

              {/* Network and Contract Information */}
              {networkInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-blue-700 dark:text-blue-400 font-medium">
                        Network: {networkInfo.name}
                      </p>
                    </div>

                    <div className="text-sm text-blue-600 dark:text-blue-500 space-y-1">
                      <p>
                        Smart Contract:
                        0x1B120b1358a0ffa78DA35e4a32b0dd5404aaC1fA
                      </p>

                      <div className="flex gap-2 mt-2">
                        <a
                          href={`${networkInfo.explorerUrl}/address/0x1B120b1358a0ffa78DA35e4a32b0dd5404aaC1fA`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                          View Contract on{" "}
                          {networkInfo.name === "Ethereum Mainnet"
                            ? "Etherscan"
                            : "Explorer"}
                        </a>

                        <a
                          href={`${networkInfo.explorerUrl}/address/0x1B120b1358a0ffa78DA35e4a32b0dd5404aaC1fA#readContract`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                          Read Contract
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[var(--text-secondary)]">
              Connect your wallet to interact with the blockchain and revoke
              certificates if needed.
            </p>
          )}
        </div>
      </div>

      {/* Where Certificates Are Stored */}
      <div className="mb-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            Where Your Certificates Are Stored
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-3">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                🌐 Blockchain
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-500">
                Certificate metadata (name, course, validity) is stored on
                Ethereum blockchain at contract address:{" "}
                <code className="text-xs">
                  0x1B120b1358a0ffa78DA35e4a32b0dd5404aaC1fA
                </code>
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                🗄️ Database
              </h3>
              <p className="text-sm text-green-600 dark:text-green-500">
                Certificate information is cached in our database for fast
                retrieval and display. This includes all blockchain data plus
                additional metadata.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                📄 IPFS
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-500">
                Actual certificate documents (PDFs, images) are stored on IPFS
                (InterPlanetary File System) for decentralized, permanent
                storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-secondary)]">
            Loading certificates...
          </p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-secondary)]">No certificates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate.certificateId}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold">{certificate.studentName}</h3>
                  <p className="text-[var(--text-secondary)]">
                    {certificate.courseName}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    certificate.isValid
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {certificate.isValid ? (
                    <div className="flex items-center">
                      <FiCheck className="mr-1" />
                      Valid
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FiX className="mr-1" />
                      Revoked
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-[var(--text-secondary)] mb-4">
                <p>Issued on: {formatDate(certificate.issueDate)}</p>
                <p className="truncate">
                  ID: {certificate.certificateId.substring(0, 16)}...
                </p>

                {/* Blockchain Links */}
                {networkInfo && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Blockchain:
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={`${networkInfo.explorerUrl}/tx/${certificate.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--primary-color)] hover:underline"
                        title="View transaction on blockchain"
                      >
                        Transaction
                      </a>
                      {certificate.ipfsHash && (
                        <a
                          href={`https://blue-secret-pinniped-438.mypinata.cloud/ipfs/${certificate.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--primary-color)] hover:underline"
                          title="View certificate document on IPFS"
                        >
                          Document
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewCertificate(certificate)}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  <FiEye className="mr-1" />
                  View
                </button>

                {certificate.isValid &&
                  walletConnected &&
                  canRevokeCertificate(certificate) && (
                    <button
                      onClick={() =>
                        handleRevokeCertificate(certificate.certificateId)
                      }
                      disabled={isRevoking}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                    >
                      <FiTrash2 className="mr-1" />
                      Revoke
                    </button>
                  )}

                {/* Sync button for all certificates */}
                {walletConnected && (
                  <button
                    onClick={() =>
                      handleSyncCertificate(certificate.certificateId)
                    }
                    disabled={isSyncing}
                    className="btn btn-outline text-xs py-1 px-2"
                    title="Sync certificate status with blockchain"
                  >
                    <FiRefreshCw
                      className={`mr-1 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    Sync
                  </button>
                )}

                {/* Debug button to check certificate status */}
                {walletConnected && (
                  <button
                    onClick={() =>
                      checkCertificateStatus(certificate.certificateId)
                    }
                    className="btn btn-outline text-xs py-1 px-2"
                    title="Check certificate status on blockchain"
                  >
                    Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Details Modal */}
      {showModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card-bg)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Certificate Details</h2>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCertificate.isValid
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {selectedCertificate.isValid ? (
                    <div className="flex items-center">
                      <FiCheck className="mr-1" />
                      Valid
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FiX className="mr-1" />
                      Revoked
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Student Name:
                  </p>
                  <p className="font-medium">
                    {selectedCertificate.studentName}
                  </p>
                </div>

                <div>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Course Name:
                  </p>
                  <p className="font-medium">
                    {selectedCertificate.courseName}
                  </p>
                </div>

                <div>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Issue Date:
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedCertificate.issueDate)}
                  </p>
                </div>

                <div>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Certificate ID:
                  </p>
                  <p className="font-medium break-all text-sm">
                    {selectedCertificate.certificateId}
                  </p>
                </div>

                {selectedCertificate.ipfsHash && (
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Certificate Document:
                    </p>
                    <a
                      href={api.getIPFSUrl(selectedCertificate.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary-color)] hover:underline"
                    >
                      View Certificate Document
                    </a>
                  </div>
                )}

                {selectedCertificate.txHash && (
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Transaction Hash:
                    </p>
                    <p className="font-medium break-all text-sm">
                      {selectedCertificate.txHash}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={handleCloseModal} className="btn btn-outline">
                  Close
                </button>

                {selectedCertificate.isValid &&
                  walletConnected &&
                  canRevokeCertificate(selectedCertificate) && (
                    <button
                      onClick={() =>
                        handleRevokeCertificate(
                          selectedCertificate.certificateId
                        )
                      }
                      disabled={isRevoking}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex items-center"
                    >
                      <FiTrash2 className="mr-1" />
                      {isRevoking ? "Revoking..." : "Revoke Certificate"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCertificates;
