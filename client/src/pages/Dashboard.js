import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  QrCode,
  Shield,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import Layout from '../components/Layout';

const features = [
  {
    icon: <QrCode size={40} className="text-te-accent mb-4" />,
    title: 'Scan de codes QR',
    desc: 'Scannez facilement les codes QR pour accéder aux informations des équipements.',
    bg: 'bg-te-card',
  },
  {
    icon: <Shield size={40} className="text-te-blue mb-4" />,
    title: 'Contrôle de sécurité',
    desc: 'Suivez en temps réel l’état des contrôles et assurez la conformité.',
    bg: 'bg-te-card',
  },
  {
    icon: <BarChart2 size={40} className="text-te-gray mb-4" />,
    title: 'Rapports et statistiques',
    desc: 'Générez des analyses détaillées sur l’état des équipements pour une meilleure gestion.',
    bg: 'bg-te-card',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        axios.get('/api/tickets/stats/overview'),
        axios.get('/api/tickets?limit=5')
      ]);
      
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.tickets);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-warning-600 bg-warning-100';
      case 'in-progress':
        return 'text-primary-600 bg-primary-100';
      case 'resolved':
        return 'text-success-600 bg-success-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-danger-600 bg-danger-100';
      case 'high':
        return 'text-warning-600 bg-warning-100';
      case 'medium':
        return 'text-primary-600 bg-primary-100';
      case 'low':
        return 'text-success-600 bg-success-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Layout
      title="Bienvenue sur QR4Safety"
      subtitle="La solution de TotalEnergies Marketing Services pour la gestion et le contrôle de sécurité des équipements."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName}! Here's what's happening today.
            </p>
          </div>
          {user?.role === 'gas-station' && (
            <Link
              to="/tickets/create"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Ticket className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.overview?.total || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.overview?.open || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.overview?.inProgress || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.overview?.resolved || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Alerts */}
        {(stats?.overview?.critical > 0 || stats?.overview?.high > 0) && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Priority Alerts</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.overview?.critical > 0 && (
                  <div className="flex items-center p-3 bg-danger-50 rounded-lg">
                    <XCircle className="h-5 w-5 text-danger-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-danger-900">
                        {stats.overview.critical} Critical Tickets
                      </p>
                      <p className="text-xs text-danger-600">Requires immediate attention</p>
                    </div>
                  </div>
                )}
                {stats?.overview?.high > 0 && (
                  <div className="flex items-center p-3 bg-warning-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-warning-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-warning-900">
                        {stats.overview.high} High Priority Tickets
                      </p>
                      <p className="text-xs text-warning-600">Needs attention soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Tickets */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
              <Link
                to="/tickets"
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent tickets</p>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                          {ticket.title}
                        </Link>
                        <span className={`badge ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('-', ' ')}
                        </span>
                        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {ticket.gasStationLocation} • Reported by {ticket.reportedBy?.firstName} {ticket.reportedBy?.lastName}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/tickets"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Ticket className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">View All Tickets</p>
                  <p className="text-xs text-gray-500">Browse and manage tickets</p>
                </div>
              </Link>
              
              {user?.role === 'gas-station' && (
                <Link
                  to="/tickets/create"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-6 w-6 text-success-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create Ticket</p>
                    <p className="text-xs text-gray-500">Report a new issue</p>
                  </div>
                </Link>
              )}
              
              {(user?.role === 'admin' || user?.role === 'help-desk') && (
                <Link
                  to="/users"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-6 w-6 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">View and manage users</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {features.map((f, i) => (
          <div key={i} className={`te-card flex flex-col items-center text-center ${f.bg}`} style={{ minHeight: 220 }}>
            {f.icon}
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{f.title}</h3>
            <p className="text-te-gray">{f.desc}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Dashboard; 