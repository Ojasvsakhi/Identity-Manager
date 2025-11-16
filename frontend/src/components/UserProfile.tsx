import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, Profile } from '../services/api';
import './UserProfile.css';

// Constants for dropdown options
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];
const CASTES = ['General', 'OBC', 'SC', 'ST', 'Other'];

const COMMON_OCCUPATIONS = [
  'Government Employee',
  'Teacher',
  'Doctor',
  'Engineer',
  'Business Owner',
  'Accountant',
  'Banking Professional',
  'Lawyer',
  'Architect',
  'Civil Servant',
  'Police Officer',
  'Military Personnel',
  'Nurse',
  'Pharmacist',
  'Dentist',
  'Veterinarian',
  'Scientist',
  'Professor',
  'Journalist',
  'Artist',
  'Musician',
  'Actor',
  'Sports Professional',
  'Chef',
  'Hotel Manager',
  'Travel Agent',
  'Real Estate Agent',
  'Insurance Agent',
  'Sales Professional',
  'Marketing Professional',
  'HR Professional',
  'Administrative Staff',
  'Retail Manager',
  'Transportation Professional',
  'Construction Worker',
  'Farmer',
  'Student',
  'Homemaker',
  'Retired',
  'Unemployed',
  'Other'
];

const INDIAN_ENGINEERING_COLLEGES = [
  'IIT Bombay',
  'IIT Delhi',
  'IIT Madras',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Roorkee',
  'IIT Guwahati',
  'IIT Hyderabad',
  'IIT Indore',
  'IIT BHU',
  'IIT Dhanbad',
  'IIT Ropar',
  'IIT Patna',
  'IIT Gandhinagar',
  'IIT Jodhpur',
  'IIT Mandi',
  'IIT Palakkad',
  'IIT Tirupati',
  'IIT Bhilai',
  'IIT Goa',
  'IIT Jammu',
  'IIT Dharwad',
  'NIT Trichy',
  'NIT Surathkal',
  'NIT Warangal',
  'NIT Calicut',
  'NIT Rourkela',
  'NIT Allahabad',
  'NIT Kurukshetra',
  'NIT Jaipur',
  'BITS Pilani',
  'DTU Delhi',
  'NSIT Delhi',
  'VIT Vellore',
  'Manipal Institute of Technology',
  'PSG Tech Coimbatore',
  'COEP Pune',
  'Other'
];

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomEducation, setShowCustomEducation] = useState(false);
  const [customEducation, setCustomEducation] = useState('');
  const [showCustomOccupation, setShowCustomOccupation] = useState(false);
  const [customOccupation, setCustomOccupation] = useState('');
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getUserProfile();
        setProfile(data);
        setFormData({ ...data });
        if (data?.education && !INDIAN_ENGINEERING_COLLEGES.includes(data.education)) {
          setShowCustomEducation(true);
          setCustomEducation(data.education);
        }
        if (data?.occupation && !COMMON_OCCUPATIONS.includes(data.occupation)) {
          setShowCustomOccupation(true);
          setCustomOccupation(data.occupation);
        }
      } catch (error) {
        setError('Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'education') {
      if (value === 'Other') {
        setShowCustomEducation(true);
        setFormData(prev => ({ ...prev, education: customEducation }));
      } else {
        setShowCustomEducation(false);
        setCustomEducation('');
        setFormData(prev => ({ ...prev, education: value }));
      }
    } else if (name === 'occupation') {
      if (value === 'Other') {
        setShowCustomOccupation(true);
        setFormData(prev => ({ ...prev, occupation: customOccupation }));
      } else {
        setShowCustomOccupation(false);
        setCustomOccupation('');
        setFormData(prev => ({ ...prev, occupation: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomEducation(value);
    setFormData(prev => ({ ...prev, education: value }));
  };

  const handleCustomOccupationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomOccupation(value);
    setFormData(prev => ({ ...prev, occupation: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isPublic: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await profileService.updateUserProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="neumorphic-container">
        <h2 className="text-center">Edit My Profile</h2>
        <form className="neumorphic-form" onSubmit={handleSubmit}>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Full Name</label>
            <input className="neumorphic-input" name="name" value={formData.name || ''} onChange={handleInputChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Email</label>
            <input className="neumorphic-input" name="email" value={formData.email || ''} onChange={handleInputChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Role</label>
            <input className="neumorphic-input" name="role" value={formData.role || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Bio</label>
            <textarea className="neumorphic-input" name="bio" value={formData.bio || ''} onChange={handleInputChange} rows={3} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Gender</label>
            <select className="neumorphic-input" name="gender" value={formData.gender || 'Other'} onChange={handleSelectChange}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Marital Status</label>
            <select className="neumorphic-input" name="maritalStatus" value={formData.maritalStatus || 'Single'} onChange={handleSelectChange}>
              {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Caste</label>
            <select className="neumorphic-input" name="caste" value={formData.caste || 'General'} onChange={handleSelectChange}>
              {CASTES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Education</label>
            <select className="neumorphic-input" name="education" value={formData.education || ''} onChange={handleSelectChange}>
              {INDIAN_ENGINEERING_COLLEGES.map(e => <option key={e} value={e}>{e}</option>)}
              <option value="Other">Other</option>
            </select>
            {showCustomEducation && (
              <input className="neumorphic-input" placeholder="Enter your education" value={customEducation} onChange={handleCustomEducationChange} />
            )}
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Occupation</label>
            <select className="neumorphic-input" name="occupation" value={formData.occupation || ''} onChange={handleSelectChange}>
              {COMMON_OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
              <option value="Other">Other</option>
            </select>
            {showCustomOccupation && (
              <input className="neumorphic-input" placeholder="Enter your occupation" value={customOccupation} onChange={handleCustomOccupationChange} />
            )}
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Location</label>
            <input className="neumorphic-input" name="location" value={formData.location || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Phone Number</label>
            <input className="neumorphic-input" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Website</label>
            <input className="neumorphic-input" name="website" value={formData.website || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Social Links</label>
            <input className="neumorphic-input" name="socialLinks" value={formData.socialLinks || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Skills</label>
            <input className="neumorphic-input" name="skills" value={formData.skills || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Experience</label>
            <input className="neumorphic-input" name="experience" value={formData.experience || ''} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Notes</label>
            <textarea className="neumorphic-input" name="notes" value={formData.notes || ''} onChange={handleInputChange} rows={2} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Public Profile</label>
            <input type="checkbox" checked={!!formData.isPublic} onChange={handleSwitchChange} />
            <span style={{ marginLeft: 8 }}>{formData.isPublic ? 'Yes' : 'No'}</span>
          </div>
          <button className="neumorphic-btn primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
        {success && <div className="neumorphic-alert success">Profile updated successfully!</div>}
        {error && <div className="neumorphic-alert error">{error}</div>}
      </div>
    </div>
  );
};

export default UserProfile; 