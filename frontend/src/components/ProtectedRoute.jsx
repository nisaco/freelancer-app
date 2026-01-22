import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // If no token or user, send them to login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required (like 'admin') and user doesn't have it
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;