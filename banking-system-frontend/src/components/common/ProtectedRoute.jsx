import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { accessToken, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;

  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;