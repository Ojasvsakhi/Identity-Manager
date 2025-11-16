import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { profileService } from '../services/api';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Settings form state
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    username: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileData = await profileService.getUserProfile();
        setSettings({
          name: profileData.name || '',
          email: profileData.email || '',
          username: profileData.name || ''
        });
      } catch (error) {
        setError('Failed to load user data');
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await userService.updateSettings(settings);
      setSuccess('Settings updated successfully');
    } catch (error) {
      setError('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      await userService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await userService.deleteAccount(deletePassword);
      setDeleteDialogOpen(false);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      setError('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="neumorphic-container">
        <h2 className="text-center">Account Settings</h2>
        <form className="neumorphic-form" onSubmit={handleUpdateSettings}>
          <h3>Profile Settings</h3>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Username</label>
            <input className="neumorphic-input" name="username" value={settings.username} onChange={handleSettingsChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Name</label>
            <input className="neumorphic-input" name="name" value={settings.name} onChange={handleSettingsChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Email</label>
            <input className="neumorphic-input" name="email" value={settings.email} onChange={handleSettingsChange} required />
          </div>
          <button className="neumorphic-btn primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
        <form className="neumorphic-form" onSubmit={handleUpdatePassword} style={{ marginTop: 32 }}>
          <h3>Change Password</h3>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Current Password</label>
            <input className="neumorphic-input" type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">New Password</label>
            <input className="neumorphic-input" type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Confirm New Password</label>
            <input className="neumorphic-input" type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
          </div>
          <button className="neumorphic-btn primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button className="neumorphic-btn" style={{ color: '#f44336' }} onClick={() => setDeleteDialogOpen(true)}>
            Delete Account
          </button>
        </div>
        {success && <div className="neumorphic-alert success">{success}</div>}
        {error && <div className="neumorphic-alert error">{error}</div>}
      </div>
      {deleteDialogOpen && (
        <div className="neumorphic-modal">
          <div className="neumorphic-modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>Enter your password to confirm account deletion:</p>
            <input className="neumorphic-input" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
            <div className="modal-actions">
              <button className="neumorphic-btn" onClick={() => setDeleteDialogOpen(false)}>Cancel</button>
              <button className="neumorphic-btn primary" onClick={handleDeleteAccount} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 