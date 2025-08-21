import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const IPFS_GATEWAY = "https://blue-secret-pinniped-438.mypinata.cloud/ipfs/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Issue a certificate
export const issueCertificate = async (formData) => {
  try {
    const response = await api.post("/certificates/issue", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error - Issue Certificate:", error);
    throw error;
  }
};

// Verify a certificate
export const verifyCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/verify/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error("API Error - Verify Certificate:", error);
    throw error;
  }
};

// Revoke a certificate
export const revokeCertificate = async (certificateId) => {
  try {
    const response = await api.post(`/certificates/revoke/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error("API Error - Revoke Certificate:", error);
    throw error;
  }
};

// Sync individual certificate status
export const syncCertificateStatus = async (certificateId) => {
  try {
    const response = await api.post(`/certificates/sync/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error("API Error - Sync Certificate Status:", error);
    throw error;
  }
};

// Sync all certificates
export const syncAllCertificates = async () => {
  try {
    const response = await api.post("/certificates/sync-all");
    return response.data;
  } catch (error) {
    console.error("API Error - Sync All Certificates:", error);
    throw error;
  }
};

// Get all certificates
export const getAllCertificates = async () => {
  try {
    const response = await api.get("/certificates/all");
    return response.data;
  } catch (error) {
    console.error("API Error - Get All Certificates:", error);
    throw error;
  }
};

// Get certificate document URL from IPFS hash
export const getIPFSUrl = (ipfsHash) => {
  return `${IPFS_GATEWAY}${ipfsHash}`;
};
