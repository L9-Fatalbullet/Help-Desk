import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">TotalAssist Dashboard</h1>
          <p className="text-te-gray">
            Bienvenue sur TotalAssist, la solution IT help desk pour les stations-service.
          </p>
        </div>
        {user?.role === 'gas-station' && (
          <Link
            to="/tickets/create"
            className="te-accent-btn flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nouveau ticket
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="te-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Ticket className="h-8 w-8 text-te-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-te-gray">Total Tickets</p>
              <p className="text-2xl font-semibold text-white">
                {stats?.overview?.total || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="te-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-te-gray">Open Tickets</p>
              <p className="text-2xl font-semibold text-white">
                {stats?.overview?.open || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="te-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-te-gray">In Progress</p>
              <p className="text-2xl font-semibold text-white">
                {stats?.overview?.inProgress || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="te-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-te-gray">Resolved</p>
              <p className="text-2xl font-semibold text-white">
                {stats?.overview?.resolved || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      {(stats?.overview?.critical > 0 || stats?.overview?.high > 0) && (
        <div className="te-card">
          <div className="flex items-center gap-4">
            <XCircle className="h-6 w-6 text-red-400" />
            <span className="text-white font-semibold">
              {stats?.overview?.critical || 0} Critical, {stats?.overview?.high || 0} High Priority Tickets
            </span>
          </div>
        </div>
      )}

      {/* Recent Tickets */}
      <div className="te-card">
        <h2 className="text-lg font-bold text-white mb-4">Tickets récents</h2>
        {recentTickets.length === 0 ? (
          <p className="text-te-gray">Aucun ticket récent</p>
        ) : (
          <div className="space-y-2">
            {recentTickets.map((ticket) => (
              <div key={ticket.id || ticket._id} className="border-b border-te-header py-2 flex items-center justify-between">
                <div>
                  <Link to={`/tickets/${ticket.id || ticket._id}`} className="text-te-accent font-medium hover:underline">
                    {ticket.title}
                  </Link>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                </div>
                <span className="text-te-gray text-xs">{format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 