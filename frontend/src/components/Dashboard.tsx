import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, Profile } from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="neumorphic-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1>Hello, {userProfile?.name || 'User'}!</h1>
              <p>Manage your profile and explore other profiles</p>
            </div>
            <div className="welcome-avatar">
              <div className="avatar">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Profile</h2>
            <div className="header-actions">
              <span className={`status-chip ${userProfile?.isPublic ? 'public' : 'private'}`}>
                {userProfile?.isPublic ? '👁️ Public' : '🙈 Private'}
              </span>
              <button 
                className="neumorphic-btn edit-btn"
                onClick={() => navigate('/profile')}
                title="Edit Profile"
              >
                ✏️
              </button>
            </div>
          </div>

          {userProfile ? (
            <div className="profile-content">
              <div className="profile-header">
                <h3>{userProfile.name}</h3>
                <p className="role">{userProfile.role}</p>
                {userProfile.bio && (
                  <p className="bio">{userProfile.bio}</p>
                )}
              </div>

              <div className="profile-divider"></div>

              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-icon">🎓</span>
                  <span className="detail-text">{userProfile.education || 'Not specified'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{userProfile.location || 'Not specified'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💼</span>
                  <span className="detail-text">{userProfile.occupation || 'Not specified'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📧</span>
                  <span className="detail-text">{userProfile.email}</span>
                </div>

                {userProfile.phoneNumber && (
                  <div className="detail-item">
                    <span className="detail-icon">📞</span>
                    <span className="detail-text">{userProfile.phoneNumber}</span>
                  </div>
                )}

                {userProfile.website && (
                  <div className="detail-item">
                    <span className="detail-icon">🌐</span>
                    <span className="detail-text">{userProfile.website}</span>
                  </div>
                )}

                {userProfile.socialLinks && (
                  <div className="social-links">
                    <a href={userProfile.socialLinks} target="_blank" rel="noopener noreferrer" className="social-link">
                      💼 LinkedIn
                    </a>
                    <a href={userProfile.socialLinks} target="_blank" rel="noopener noreferrer" className="social-link">
                      🐙 GitHub
                    </a>
                    <a href={userProfile.socialLinks} target="_blank" rel="noopener noreferrer" className="social-link">
                      🐦 Twitter
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-profile">
              <p>You haven't created your profile yet. Create one to get started!</p>
              <button
                className="neumorphic-btn primary"
                onClick={() => navigate('/profile')}
              >
                Create Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="neumorphic-alert error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 