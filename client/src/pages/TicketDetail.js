import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Download,
  User,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinTicket, leaveTicket } = useSocket();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInternalComment, setShowInternalComment] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    fetchTicket();
    joinTicket(id);
    return () => {
      leaveTicket(id);
    };
  }, [id, fetchTicket, joinTicket, leaveTicket]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await axios.put(`/api/tickets/${id}`, { status: newStatus });
      await fetchTicket();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const onSubmitComment = async (data) => {
    try {
      await axios.post(`/api/tickets/${id}/comments`, {
        content: data.content,
        isInternal: showInternalComment
      });
      await fetchTicket();
      reset();
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = `/uploads/${attachment.filename}`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-warning-600 bg-warning-100';
      case 'in-progress': return 'text-primary-600 bg-primary-100';
      case 'resolved': return 'text-success-600 bg-success-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-danger-600 bg-danger-100';
      case 'high': return 'text-warning-600 bg-warning-100';
      case 'medium': return 'text-primary-600 bg-primary-100';
      case 'low': return 'text-success-600 bg-success-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/tickets')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-gray-600">Ticket #{ticket._id.slice(-8)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`badge ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('-', ' ')}
          </span>
          <span className={`badge ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
            </div>
            <div className="card-body">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {ticket.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadAttachment(attachment)}
                        className="btn btn-secondary btn-sm"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Comments</h3>
            </div>
            <div className="card-body space-y-6">
              {/* Add Comment */}
              <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4">
                <div>
                  <textarea
                    rows={3}
                    className={`input ${errors.content ? 'input-error' : ''}`}
                    placeholder="Add a comment..."
                    {...register('content', { required: 'Comment is required' })}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-danger-600">{errors.content.message}</p>
                  )}
                </div>
                
                {(user?.role === 'admin' || user?.role === 'help-desk') && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="internal-comment"
                      checked={showInternalComment}
                      onChange={(e) => setShowInternalComment(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="internal-comment" className="ml-2 text-sm text-gray-700">
                      Internal comment (not visible to gas station staff)
                    </label>
                  </div>
                )}
                
                <button type="submit" className="btn btn-primary">
                  Add Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {ticket.comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      comment.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {comment.user.firstName} {comment.user.lastName}
                            {comment.isInternal && (
                              <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                Internal
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Ticket Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{ticket.gasStationLocation}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Reported by</p>
                  <p className="text-sm text-gray-600">
                    {ticket.reportedBy.firstName} {ticket.reportedBy.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {(user?.role === 'admin' || user?.role === 'help-desk') && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div className="card-body space-y-4">
                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusUpdate('open')}
                      disabled={updating || ticket.status === 'open'}
                      className="btn btn-secondary btn-sm disabled:opacity-50"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('in-progress')}
                      disabled={updating || ticket.status === 'in-progress'}
                      className="btn btn-secondary btn-sm disabled:opacity-50"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      disabled={updating || ticket.status === 'resolved'}
                      className="btn btn-success btn-sm disabled:opacity-50"
                    >
                      Resolved
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('closed')}
                      disabled={updating || ticket.status === 'closed'}
                      className="btn btn-secondary btn-sm disabled:opacity-50"
                    >
                      Closed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 