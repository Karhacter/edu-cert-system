import React from 'react';
import { Navigate } from 'react-router-dom';
import adminService from '../services/adminService';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = adminService.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default PrivateRoute;
