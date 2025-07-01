import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  User,
  Menu,
  X,
  LogOut,
  Plus
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children, title, subtitle, actionButton }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    ...(user?.role === 'admin' || user?.role === 'help-desk' 
      ? [{ name: 'Users', href: '/users', icon: Users }] 
      : []
    ),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-te-dark">
      <header className="te-header flex items-center justify-between px-8 py-3">
        <div className="flex items-center">
          <img src="/te-logo.png" alt="TotalEnergies Logo" className="h-10 mr-3" />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            QR4Safety
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Example: dark/light mode toggle could go here */}
          {actionButton ? actionButton : (
            <Link to="/profile" className="te-accent-btn">Mon compte</Link>
          )}
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4">
        {title && (
          <h1 className="te-title mb-2">
            Bienvenue sur <span className="te-title-accent">QR4Safety</span>
          </h1>
        )}
        {subtitle && (
          <p className="text-lg text-te-gray mb-10 max-w-2xl">{subtitle}</p>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout; 