import axios from "axios";
import adminService from "./../services/adminService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = adminService.getToken?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard
export const getDashboardStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data;
};

// Admin
export const registerUser = async (payload) => {
  const { data } = await api.post("/admin/register", payload);
  return data;
};

export const getEmployees = async () => {
  const { data } = await api.get("/admin/employees");
  return data;
};

export const getOrganizations = async () => {
  const { data } = await api.get("/admin/organizations");
  return data;
};

export const getRegistration = async (address) => {
  const { data } = await api.get(`/admin/registration/${address}`);
  return data;
};

export const checkIsEmployee = async (address) => {
  const { data } = await api.get(`/admin/is-employee/${address}`);
  return data;
};

export const checkIsOrganization = async (address) => {
  const { data } = await api.get(`/admin/is-organization/${address}`);
  return data;
};

// Auth endpoints
export const adminLogin = async ({ username, password }) => {
  const { data } = await api.post(`/auth/login`, { username, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get(`/auth/me`);
  return data;
};
