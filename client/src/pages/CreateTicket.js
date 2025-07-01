import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X, File } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      formData.append('category', data.category);
      formData.append('gasStationLocation', user.gasStationLocation);

      files.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post('/api/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Ticket created successfully!');
      navigate('/tickets');
      reset();
      setFiles([]);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create ticket';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="text-gray-600">Report a technical issue for your gas station</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Ticket Information</h3>
          </div>
          <div className="card-body space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                className={`input mt-1 ${errors.title ? 'input-error' : ''}`}
                placeholder="Brief description of the issue"
                {...register('title', {
                  required: 'Title is required',
                  maxLength: {
                    value: 200,
                    message: 'Title must be less than 200 characters'
                  }
                })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                rows={6}
                className={`input mt-1 ${errors.description ? 'input-error' : ''}`}
                placeholder="Provide detailed information about the issue..."
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters'
                  }
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
              )}
            </div>

            {/* Priority and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority *
                </label>
                <select
                  id="priority"
                  className={`input mt-1 ${errors.priority ? 'input-error' : ''}`}
                  {...register('priority', { required: 'Priority is required' })}
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-danger-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  className="input mt-1"
                  {...register('category')}
                >
                  <option value="">Select category</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="payment">Payment</option>
                  <option value="fuel-system">Fuel System</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Gas Station Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gas Station Location
              </label>
              <input
                type="text"
                value={user.gasStationLocation}
                disabled
                className="input mt-1 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Attachments (Optional)</h3>
            <p className="text-sm text-gray-500">Upload screenshots, logs, or other relevant files</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="btn btn-secondary cursor-pointer">
                    Choose Files
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.log"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, PDF, DOC, TXT, LOG up to 10MB each
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket; 