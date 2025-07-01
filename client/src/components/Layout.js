import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Users as UsersIcon,
  User,
  Menu,
  X,
  LogOut,
  Plus
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    ...(user?.role === 'admin' || user?.role === 'help-desk'
      ? [{ name: 'Users', href: '/users', icon: UsersIcon }]
      : []
    ),
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen flex bg-te-dark">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-te-header text-white shadow-lg">
        <div className="flex items-center px-6 py-5 border-b border-te-card">
          <img src="/te-logo.png" alt="TotalEnergies Logo" className="h-9 mr-3" />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            Help Desk
          </span>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base ${isActive(item.href) ? 'bg-te-card text-white' : 'text-te-gray hover:bg-te-card hover:text-white'}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="px-6 pb-6 mt-auto">
          <button onClick={handleLogout} className="te-accent-btn w-full flex items-center justify-center gap-2">
            <LogOut className="h-5 w-5" /> Déconnexion
          </button>
        </div>
      </aside>
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-te-header p-2 rounded-full shadow-lg text-white"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-te-header text-white flex flex-col h-full shadow-lg">
            <div className="flex items-center px-6 py-5 border-b border-te-card">
              <img src="/te-logo.png" alt="TotalEnergies Logo" className="h-9 mr-3" />
              <span className="text-xl font-bold tracking-tight">Help Desk</span>
              <button className="ml-auto text-te-gray" onClick={() => setSidebarOpen(false)}><X className="h-6 w-6" /></button>
            </div>
            <nav className="flex-1 px-2 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base ${isActive(item.href) ? 'bg-te-card text-white' : 'text-te-gray hover:bg-te-card hover:text-white'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="px-6 pb-6 mt-auto">
              <button onClick={handleLogout} className="te-accent-btn w-full flex items-center justify-center gap-2">
                <LogOut className="h-5 w-5" /> Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-8 py-4 bg-te-header shadow-md md:hidden">
          <div className="flex items-center">
            <img src="/te-logo.png" alt="TotalEnergies Logo" className="h-8 mr-2" />
            <span className="text-lg font-bold tracking-tight">Help Desk</span>
          </div>
          <button onClick={handleLogout} className="te-accent-btn flex items-center gap-2 px-4 py-1 text-sm">
            <LogOut className="h-5 w-5" /> Déconnexion
          </button>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 