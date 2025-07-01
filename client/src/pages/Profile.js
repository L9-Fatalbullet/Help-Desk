import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const onSubmitProfile = async (data) => {
    try {
      setIsUpdating(true);
      await updateProfile(data);
      resetProfile(data);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setIsChangingPassword(true);
      await changePassword(data.currentPassword, data.newPassword);
      resetPassword();
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and security</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Change Password
          </button>
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </div>
          <div className="card-body">
            <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className={`input mt-1 ${profileErrors.firstName ? 'input-error' : ''}`}
                    {...registerProfile('firstName', { required: 'First name is required' })}
                  />
                  {profileErrors.firstName && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className={`input mt-1 ${profileErrors.lastName ? 'input-error' : ''}`}
                    {...registerProfile('lastName', { required: 'Last name is required' })}
                  />
                  {profileErrors.lastName && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email}
                  disabled
                  className="input mt-1 bg-gray-50"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="input mt-1"
                  {...registerProfile('phone')}
                />
              </div>

              {user?.role === 'gas-station' && (
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Gas Station Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={user?.gasStationLocation}
                    disabled
                    className="input mt-1 bg-gray-50"
                  />
                  <p className="mt-1 text-sm text-gray-500">Location cannot be changed</p>
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={user?.role?.replace('-', ' ')}
                  disabled
                  className="input mt-1 bg-gray-50"
                />
                <p className="mt-1 text-sm text-gray-500">Role cannot be changed</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-primary"
                >
                  {isUpdating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className={`input mt-1 ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className={`input mt-1 ${passwordErrors.newPassword ? 'input-error' : ''}`}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`input mt-1 ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === watch('newPassword') || 'Passwords do not match'
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn btn-primary"
                >
                  {isChangingPassword ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing...
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 