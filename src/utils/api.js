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

// User management functions
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("API Error - Get Users:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("API Error - Create User:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("API Error - Update User:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("API Error - Delete User:", error);
    throw error;
  }
};
