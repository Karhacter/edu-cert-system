import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiEye, FiTrash2, FiLink, FiLogOut } from 'react-icons/fi';
import * as api from '../../utils/api';
import { connectWallet, disconnectWallet, revokeCertificate } from '../../utils/web3';

const ViewCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          const { address } = await connectWallet();
          setWalletAddress(address);
          setWalletConnected(true);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet from MetaMask
          handleDisconnectWallet();
        } else {
          // User switched accounts
          setWalletAddress(accounts[0]);
        }
      });
    }
    
    // Load certificates
    loadCertificates();
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };
  
  // Disconnect wallet
  const handleDisconnectWallet = async () => {
    try {
      setIsDisconnecting(true);
      await disconnectWallet();
      setWalletConnected(false);
      setWalletAddress('');
      toast.success('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet. Please try again.');
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
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // View certificate details
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowModal(true);
  };

  // Revoke certificate
  const handleRevokeCertificate = async (certificateId) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsRevoking(true);
      await revokeCertificate(certificateId);
      await api.revokeCertificate(certificateId);
      
      toast.success('Certificate revoked successfully!');
      
      // Refresh certificates
      await loadCertificates();
      
      // Close modal if open
      if (showModal) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error('Failed to revoke certificate. Please try again.');
    } finally {
      setIsRevoking(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>View Certificates</h1>
      </div>
      
      {/* Wallet Status */}
      <div className="mb-6">
        <div className="card">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Wallet Status</h2>
            
            {!walletConnected && (
              <button onClick={handleConnectWallet} className="btn btn-primary text-sm py-1 px-3">
                Connect Wallet
              </button>
            )}
          </div>
          
          {walletConnected ? (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
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
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[var(--text-secondary)]">
              Connect your wallet to interact with the blockchain and revoke certificates if needed.
            </p>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-secondary)]">Loading certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-secondary)]">No certificates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div key={certificate.certificateId} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold">{certificate.studentName}</h3>
                  <p className="text-[var(--text-secondary)]">{certificate.courseName}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    certificate.isValid
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
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
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewCertificate(certificate)}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  <FiEye className="mr-1" />
                  View
                </button>
                
                {certificate.isValid && walletConnected && (
                  <button
                    onClick={() => handleRevokeCertificate(certificate.certificateId)}
                    disabled={isRevoking}
                    className="btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                  >
                    <FiTrash2 className="mr-1" />
                    Revoke
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
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
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
                  <p className="text-[var(--text-secondary)] text-sm">Student Name:</p>
                  <p className="font-medium">{selectedCertificate.studentName}</p>
                </div>
                
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">Course Name:</p>
                  <p className="font-medium">{selectedCertificate.courseName}</p>
                </div>
                
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">Issue Date:</p>
                  <p className="font-medium">
                    {formatDate(selectedCertificate.issueDate)}
                  </p>
                </div>
                
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">Certificate ID:</p>
                  <p className="font-medium break-all text-sm">
                    {selectedCertificate.certificateId}
                  </p>
                </div>
                
                {selectedCertificate.ipfsHash && (
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">Certificate Document:</p>
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
                    <p className="text-[var(--text-secondary)] text-sm">Transaction Hash:</p>
                    <p className="font-medium break-all text-sm">
                      {selectedCertificate.txHash}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                >
                  Close
                </button>
                
                {selectedCertificate.isValid && walletConnected && (
                  <button
                    onClick={() => handleRevokeCertificate(selectedCertificate.certificateId)}
                    disabled={isRevoking}
                    className="btn bg-red-500 text-white hover:bg-red-600 flex items-center"
                  >
                    <FiTrash2 className="mr-1" />
                    {isRevoking ? 'Revoking...' : 'Revoke Certificate'}
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