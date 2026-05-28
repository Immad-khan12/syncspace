import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import Editor from '@/pages/Editor';
import Settings from '@/pages/Settings';
import Members from '@/pages/Members';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

const router = createBrowserRouter([
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'documents', element: <Documents /> },
      { path: 'recent',    element: <Documents /> },
      { path: 'members',   element: <Members /> },
      { path: 'settings',  element: <Settings /> },
    ],
  },

  {
    path: '/documents/:id',
    element: (
      <ProtectedRoute>
        <Editor />
      </ProtectedRoute>
    ),
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}