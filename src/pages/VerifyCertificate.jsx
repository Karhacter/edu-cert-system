import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiCheck, FiX, FiClock, FiUser, FiBook, FiFileText, FiLink, FiLogOut } from 'react-icons/fi';
import * as api from '../utils/api';
import { connectWallet, disconnectWallet } from '../utils/web3';

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check wallet connection on component mount
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
      setIsLoading(true);
      const { address } = await connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await api.verifyCertificate(certificateId);
      console.log(result)
      setCertificate(result);
      
      if (result.isValid) {
        toast.success('Certificate is valid!');
      } else {
        toast.error('Certificate is invalid or has been revoked.');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast.error('Failed to verify certificate. Please check the ID and try again.');
      setCertificate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="mb-6">Verify Certificate</h1>
      
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
              Connect your wallet to interact with the blockchain.
            </p>
          )}
        </div>
      </div>
      
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Certificate Verification</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Enter the certificate ID to verify its authenticity on the blockchain.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="certificateId" className="form-label">
              Certificate ID *
            </label>
            <div className="flex">
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="0x1a2b3c4d..."
                className="form-input rounded-r-none flex-grow"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary rounded-l-none px-6"
              >
                {isLoading ? (
                  'Verifying...'
                ) : (
                  <>
                    <FiSearch className="mr-2" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {certificate && (
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Certificate Details</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              certificate.isValid
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {certificate.isValid ? (
                <div className="flex items-center">
                  <FiCheck className="mr-1" />
                  Valid
                </div>
              ) : (
                <div className="flex items-center">
                  <FiX className="mr-1" />
                  Invalid
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1 text-[var(--text-secondary)]">
                  <FiUser className="mr-2" />
                  <p>Student Name</p>
                </div>
                <p className="font-medium text-lg">{certificate.studentName}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-1 text-[var(--text-secondary)]">
                  <FiBook className="mr-2" />
                  <p>Course Name</p>
                </div>
                <p className="font-medium text-lg">{certificate.courseName}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-1 text-[var(--text-secondary)]">
                  <FiClock className="mr-2" />
                  <p>Issue Date</p>
                </div>
                <p className="font-medium">{formatDate(certificate.issueDate)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1 text-[var(--text-secondary)]">
                  <FiFileText className="mr-2" />
                  <p>Certificate ID</p>
                </div>
                <p className="font-medium break-all text-sm">{certificateId}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-1 text-[var(--text-secondary)]">
                  <FiUser className="mr-2" />
                  <p>Issuer</p>
                </div>
                <p className="font-medium break-all text-sm">{certificate.issuer}</p>
              </div>
              
              {certificate.ipfsHash && (
                <div>
                  <div className="flex items-center mb-1 text-[var(--text-secondary)]">
                    <FiFileText className="mr-2" />
                    <p>Certificate Document</p>
                  </div>
                  <a
                    href={api.getIPFSUrl(certificate.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary-color)] hover:underline"
                  >
                    View Certificate Document
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {certificate.isValid && (
            <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                <p className="text-green-700 dark:text-green-400">
                  This certificate has been verified as authentic and has not been tampered with.
                </p>
              </div>
            </div>
          )}
          
          {!certificate.isValid && (
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-center">
                <FiX className="text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">
                  This certificate is invalid or has been revoked.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate; 