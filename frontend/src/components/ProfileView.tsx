import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService, Profile } from '../services/api';
import './ProfileView.css';

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      loadProfile(id);
    }
  }, [id]);

  const loadProfile = async (profileId: string) => {
    try {
      setLoading(true);
      const data = await profileService.getProfile(profileId);
      setProfile(data);
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name}'s Profile`,
        text: `Check out ${profile?.name}'s profile`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (loading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="neumorphic-alert error" style={{ margin: '40px auto', maxWidth: 600 }}>Profile not found</div>
    );
  }

  return (
    <div className="profile-view-container">
      <div className="neumorphic-container profile-header-card">
        <button className="neumorphic-btn" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <div className="profile-header-flex">
          <div className="profile-avatar-lg">{profile.name.charAt(0)}</div>
          <div className="profile-header-info">
            <h2>{profile.name}</h2>
            <div className="profile-role">{profile.role}</div>
            <div className="profile-header-actions">
              <button className="neumorphic-btn" onClick={handleShare} title="Share Profile">🔗</button>
              <button className="neumorphic-btn" onClick={toggleBookmark} title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Profile'}>
                {isBookmarked ? '★' : '☆'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="profile-main-content">
        <div className="neumorphic-card profile-main-card">
          <h3>About</h3>
          <div className="profile-bio">{profile.bio || 'No bio available'}</div>
          <div className="profile-details-grid">
            <div className="profile-detail-item">🎓 <span>{profile.education || 'Not specified'}</span></div>
            <div className="profile-detail-item">📍 <span>{profile.location || 'Not specified'}</span></div>
            <div className="profile-detail-item">💼 <span>{profile.occupation || 'Not specified'}</span></div>
            <div className="profile-detail-item">📧 <span>{profile.email}</span></div>
            {profile.phoneNumber && <div className="profile-detail-item">📞 <span>{profile.phoneNumber}</span></div>}
            {profile.website && <div className="profile-detail-item">🌐 <span>{profile.website}</span></div>}
          </div>
          {profile.socialLinks && (
            <div className="profile-social-links">
              <a href={profile.socialLinks} target="_blank" rel="noopener noreferrer" className="social-link">💼 LinkedIn</a>
              <a href={profile.socialLinks} target="_blank" rel="noopener noreferrer" className="social-link">🐙 GitHub</a>
              <a href={profile.socialLinks} target="_blank" rel="noopener noreferrer" className="social-link">🐦 Twitter</a>
            </div>
          )}
        </div>
        <div className="profile-sidebar">
          <div className="neumorphic-card profile-status-card">
            <h4>Profile Status</h4>
            <div className={`status-chip ${profile.isPublic ? 'public' : 'private'}`}>{profile.isPublic ? '👁️ Public Profile' : '🙈 Private Profile'}</div>
            <div className="profile-status-desc">
              {profile.isPublic ? 'This profile is visible to all users' : 'This profile is only visible to authorized users'}
            </div>
          </div>
          <div className="neumorphic-card profile-actions-card">
            <h4>Quick Actions</h4>
            <button className="neumorphic-btn primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => navigate(`/message/${profile.id}`)}>
              Send Message
            </button>
            <button className="neumorphic-btn" style={{ width: '100%' }} onClick={() => navigate('/profiles')}>
              View All Profiles
            </button>
          </div>
        </div>
      </div>
      {error && <div className="neumorphic-alert error">{error}</div>}
    </div>
  );
};

export default ProfileView; 