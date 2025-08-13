// JWT-based admin auth service
// Stores token in localStorage

const ADMIN_TOKEN_KEY = "adminJwt";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const adminService = {
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) return false;
      const payload = decodeJwt(token);
      if (!payload || !payload.exp) return false;
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowSec) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
  getToken: () => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  saveToken: (token) => {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  clearToken: () => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
  logout: () => {
    adminService.clearToken();
  },
};

export default adminService;
