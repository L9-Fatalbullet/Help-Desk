import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import Users from './pages/Users';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        } />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/create" element={<CreateTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="users" element={
            <PrivateRoute allowedRoles={['admin', 'help-desk']}>
              <Users />
            </PrivateRoute>
          } />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App; 