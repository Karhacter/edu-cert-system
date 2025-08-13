import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUpload, FiInfo, FiLogOut, FiLink } from 'react-icons/fi';
import * as api from '../../utils/api';
import { connectWallet, disconnectWallet } from '../../utils/web3';

const IssueCertificate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [form, setForm] = useState({
    studentName: '',
    courseName: '',
    issueDate: new Date().toISOString().split('T')[0],
    additionalInfo: '',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!file) {
      toast.error('Please upload a certificate file');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('studentName', form.studentName);
      formData.append('courseName', form.courseName);
      formData.append('issueDate', form.issueDate);
      formData.append('additionalInfo', form.additionalInfo);
      formData.append('certificate', file);
      
      // Send data to API
      const response = await api.issueCertificate(formData);
      
      // Set result
      setResult(response);
      toast.success('Certificate issued successfully!');
      
      // Reset form
      setForm({
        studentName: '',
        courseName: '',
        issueDate: new Date().toISOString().split('T')[0],
        additionalInfo: '',
      });
      setFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="mb-6">Issue New Certificate</h1>
      
      {/* Wallet Connection */}
      <div className="mb-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Connect your Ethereum wallet to issue a certificate on the blockchain.
          </p>
          
          {walletConnected ? (
            <div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
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
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
      
      {/* Certificate Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-bold mb-4">Certificate Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="studentName" className="form-label">
              Student Name *
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="courseName" className="form-label">
              Course Name *
            </label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Blockchain Development"
            />
          </div>
          
          <div>
            <label htmlFor="issueDate" className="form-label">
              Issue Date *
            </label>
            <input
              type="date"
              id="issueDate"
              name="issueDate"
              value={form.issueDate}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="additionalInfo" className="form-label">
              Additional Information
            </label>
            <input
              type="text"
              id="additionalInfo"
              name="additionalInfo"
              value={form.additionalInfo}
              onChange={handleChange}
              className="form-input"
              placeholder="Grade, Institution, etc."
            />
          </div>
        </div>
        
        {/* File Upload */}
        <div className="mb-6">
          <label className="form-label">
            Certificate File *
          </label>
          
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6 text-center">
            {previewUrl ? (
              <div>
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Certificate Preview"
                    className="max-h-64 mx-auto rounded"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <p className="text-[var(--text-secondary)] truncate">
                    {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-red-500 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById('certificate').click()}
                className="cursor-pointer"
              >
                <FiUpload className="mx-auto text-[var(--text-secondary)] text-3xl mb-2" />
                <p className="text-[var(--text-secondary)] mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-[var(--text-secondary)] opacity-70 text-sm">
                  PNG, JPG, or PDF (Max 5MB)
                </p>
              </div>
            )}
            
            <input
              type="file"
              id="certificate"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !walletConnected}
          className="btn btn-primary w-full md:w-auto"
        >
          {isLoading ? 'Issuing Certificate...' : 'Issue Certificate'}
        </button>
      </form>
      
      {/* Result */}
      {result && (
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">Certificate Issued</h2>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <p className="text-green-700 dark:text-green-400 font-medium">
              Certificate was successfully issued on the blockchain!
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[var(--text-secondary)] text-sm">Certificate ID:</p>
              <p className="font-medium break-all">{result.certificateId}</p>
            </div>
            
            <div>
              <p className="text-[var(--text-secondary)] text-sm">Transaction Hash:</p>
              <p className="font-medium break-all">{result.txHash}</p>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Share this Certificate ID with the recipient for verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCertificate; 