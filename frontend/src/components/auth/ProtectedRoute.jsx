// ProtectedRoute.jsx — Wraps any route that requires authentication
//
// HOW IT WORKS:
// 1. Check if there's a valid token in the store
// 2. If yes → render the page
// 3. If no → redirect to /login, and remember where they were going
//            so we can redirect them back after login

import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { accessToken, user } = useAuthStore();

  if (!accessToken || !user) {
    // Save the attempted URL so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}