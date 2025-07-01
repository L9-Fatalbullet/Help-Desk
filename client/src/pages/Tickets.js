import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    location: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/api/tickets?${params}`);
      setTickets(response.data.tickets);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'badge-warning';
      case 'in-progress': return 'badge-info';
      case 'resolved': return 'badge-success';
      case 'closed': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      case 'low': return 'badge-success';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage and track support tickets</p>
        </div>
        {user?.role === 'gas-station' && (
          <Link to="/tickets/create" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="payment">Payment</option>
                <option value="fuel-system">Fuel System</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tickets found</p>
              {user?.role === 'gas-station' && (
                <Link to="/tickets/create" className="btn btn-primary mt-4">
                  Create your first ticket
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-lg font-medium text-primary-600 hover:text-primary-800"
                        >
                          {ticket.title}
                        </Link>
                        <span className={`badge ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('-', ' ')}
                        </span>
                        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {ticket.category && (
                          <span className="badge badge-gray">
                            {ticket.category}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📍 {ticket.gasStationLocation}</span>
                        <span>👤 {ticket.reportedBy?.firstName} {ticket.reportedBy?.lastName}</span>
                        {ticket.assignedTo && (
                          <span>🔧 Assigned to {ticket.assignedTo?.firstName} {ticket.assignedTo?.lastName}</span>
                        )}
                        <span>📅 {format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center px-3 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets; 