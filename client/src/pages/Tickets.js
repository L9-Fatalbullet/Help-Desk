import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    location: '',
    page: 1,
    limit: 20
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/api/tickets?${params}`);
      setTickets(response.data.tickets);
    } catch (error) {
      setError('Erreur lors du chargement des tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-700 text-yellow-200';
      case 'in-progress': return 'bg-blue-700 text-blue-200';
      case 'resolved': return 'bg-green-700 text-green-200';
      case 'closed': return 'bg-gray-700 text-gray-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-700 text-red-200';
      case 'high': return 'bg-orange-700 text-orange-200';
      case 'medium': return 'bg-blue-700 text-blue-200';
      case 'low': return 'bg-green-700 text-green-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Tickets</h1>
          <p className="text-te-gray">Gérez et suivez les tickets de support</p>
        </div>
        {user?.role === 'gas-station' && (
          <Link to="/tickets/create" className="te-accent-btn flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nouveau ticket
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="te-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-te-gray" />
              <input
                type="text"
                placeholder="Rechercher un ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 py-2 rounded bg-te-dark border border-te-gray text-white focus:outline-none focus:ring-2 focus:ring-te-accent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full py-2 rounded bg-te-dark border border-te-gray text-white focus:outline-none focus:ring-2 focus:ring-te-accent"
            >
              <option value="">Tous les statuts</option>
              <option value="open">Ouvert</option>
              <option value="in-progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full py-2 rounded bg-te-dark border border-te-gray text-white focus:outline-none focus:ring-2 focus:ring-te-accent"
            >
              <option value="">Toutes les priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full py-2 rounded bg-te-dark border border-te-gray text-white focus:outline-none focus:ring-2 focus:ring-te-accent"
            >
              <option value="">Toutes les catégories</option>
              <option value="hardware">Matériel</option>
              <option value="software">Logiciel</option>
              <option value="network">Réseau</option>
              <option value="payment">Paiement</option>
              <option value="fuel-system">Système carburant</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="te-card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-te-accent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-te-gray text-lg">Aucun ticket trouvé</p>
            {user?.role === 'gas-station' && (
              <Link to="/tickets/create" className="te-accent-btn mt-4">Créer un premier ticket</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id || ticket._id}
                className="border border-te-header rounded-lg p-4 hover:bg-te-header transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={`/tickets/${ticket.id || ticket._id}`}
                        className="text-lg font-medium text-te-accent hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${getStatusColor(ticket.status)}`}>{ticket.status?.replace('-', ' ')}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      {ticket.category && (
                        <span className="px-2 py-1 rounded text-xs font-semibold ml-2 bg-te-gray text-te-dark">
                          {ticket.category}
                        </span>
                      )}
                    </div>
                    <div className="text-te-gray text-sm mb-1">
                      {ticket.gasStationLocation && <span className="mr-2"><b>Station:</b> {ticket.gasStationLocation}</span>}
                      <span><b>Créé:</b> {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link to={`/tickets/${ticket.id || ticket._id}`} className="te-accent-btn px-4 py-1 text-sm">Voir</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets; 