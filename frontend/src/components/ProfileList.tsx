import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, Profile } from '../services/api';
import './ProfileList.css';

// Function to generate a consistent color based on a string
const generateColorFromId = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215));
  return `#${color.toString(16).padStart(6, '0')}`;
};

const ProfileList: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfiles();
      setProfiles(data);
    } catch (error) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = (profile: Profile) => {
    setSelectedProfile(profile);
    setRequestDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setRequestDialogOpen(false);
    setSelectedProfile(null);
  };

  const handleSendRequest = async () => {
    if (!selectedProfile) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileId: selectedProfile.id })
      });

      if (response.ok) {
        setError('Access request sent successfully');
        handleCloseDialog();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send access request');
      }
    } catch (err) {
      setError('Error sending access request');
      console.error(err);
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (profile.role?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (profile.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    profile.education.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-list-container">
      <div className="neumorphic-container">
        <h2 className="text-center">All Profiles</h2>
        <input
          className="neumorphic-input profile-search"
          type="text"
          placeholder="Search profiles by name, role, location, or education..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filteredProfiles.length === 0 ? (
          <div className="no-profiles text-center">
            {searchQuery ? 'No profiles match your search criteria' : 'No profiles available'}
          </div>
        ) : (
          <div className="profile-list-grid">
            {filteredProfiles.map((profile) => {
              const profileColor = generateColorFromId(profile.id);
              return (
                <div className="neumorphic-card profile-card" key={profile.id}>
                  <div className="profile-card-header">
                    <div className="profile-avatar" style={{ background: profileColor }}>
                      {profile.name.charAt(0)}
                    </div>
                    <div className="profile-card-info">
                      <h3>{profile.name}</h3>
                      <div className="profile-role">{profile.role || 'No role specified'}</div>
                      <div className="profile-location">{profile.location || 'No location'}</div>
                    </div>
                  </div>
                  <div className="profile-card-details">
                    <div className="profile-education">🎓 {profile.education || 'Not specified'}</div>
                  </div>
                  <div className="profile-card-actions">
                    {profile.isPublic ? (
                      <button
                        className="neumorphic-btn primary"
                        onClick={() => navigate(`/profiles/${profile.id}`)}
                      >
                        View Profile
                      </button>
                    ) : (
                      <button
                        className="neumorphic-btn"
                        onClick={() => handleRequestAccess(profile)}
                      >
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {requestDialogOpen && selectedProfile && (
        <div className="neumorphic-modal">
          <div className="neumorphic-modal-content">
            <h3>Request Access</h3>
            <p>Send a request to view {selectedProfile.name}'s private profile?</p>
            <div className="modal-actions">
              <button className="neumorphic-btn" onClick={handleCloseDialog}>Cancel</button>
              <button className="neumorphic-btn primary" onClick={handleSendRequest}>Send Request</button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="neumorphic-alert error">{error}</div>
      )}
    </div>
  );
};

export default ProfileList; 