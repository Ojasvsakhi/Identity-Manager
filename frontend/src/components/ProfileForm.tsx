import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileForm.css';

// Constants for dropdown options
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];
const CASTES = ['General', 'OBC', 'SC', 'ST', 'Other'];

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

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  age: string;
  gender: string;
  education: string;
  maritalStatus: string;
  caste: string;
  occupation?: string;
  location?: string;
  contact?: string;
  notes?: string;
  role?: string;
  phoneNumber?: string;
  website?: string;
  socialLinks?: string;
  skills?: string;
  experience?: string;
  isPublic: boolean;
  isUserProfile: boolean;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    age: '',
    gender: '',
    education: '',
    maritalStatus: '',
    caste: '',
    occupation: '',
    location: '',
    contact: '',
    notes: '',
    role: '',
    phoneNumber: '',
    website: '',
    socialLinks: '',
    skills: '',
    experience: '',
    isPublic: false,
    isUserProfile: false
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showCustomEducation, setShowCustomEducation] = useState<boolean>(false);
  const [customEducation, setCustomEducation] = useState<string>('');

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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomEducation(value);
    setFormData(prev => ({ ...prev, education: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isPublic: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/profiles');
      }, 1500);
    } catch (error) {
      setError('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-form-container">
      <div className="neumorphic-container">
        <h2 className="text-center">Create Profile</h2>
        <form className="neumorphic-form" onSubmit={handleSubmit}>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Full Name</label>
            <input className="neumorphic-input" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Email</label>
            <input className="neumorphic-input" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Role</label>
            <input className="neumorphic-input" name="role" value={formData.role} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Bio</label>
            <textarea className="neumorphic-input" name="bio" value={formData.bio} onChange={handleInputChange} rows={3} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Gender</label>
            <select className="neumorphic-input" name="gender" value={formData.gender} onChange={handleSelectChange}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Marital Status</label>
            <select className="neumorphic-input" name="maritalStatus" value={formData.maritalStatus} onChange={handleSelectChange}>
              {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Caste</label>
            <select className="neumorphic-input" name="caste" value={formData.caste} onChange={handleSelectChange}>
              {CASTES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Education</label>
            <select className="neumorphic-input" name="education" value={formData.education} onChange={handleSelectChange}>
              {INDIAN_ENGINEERING_COLLEGES.map(e => <option key={e} value={e}>{e}</option>)}
              <option value="Other">Other</option>
            </select>
            {showCustomEducation && (
              <input className="neumorphic-input" placeholder="Enter your education" value={customEducation} onChange={handleCustomEducationChange} />
            )}
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Location</label>
            <input className="neumorphic-input" name="location" value={formData.location} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Phone Number</label>
            <input className="neumorphic-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Website</label>
            <input className="neumorphic-input" name="website" value={formData.website} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Social Links</label>
            <input className="neumorphic-input" name="socialLinks" value={formData.socialLinks} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Skills</label>
            <input className="neumorphic-input" name="skills" value={formData.skills} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Experience</label>
            <input className="neumorphic-input" name="experience" value={formData.experience} onChange={handleInputChange} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Notes</label>
            <textarea className="neumorphic-input" name="notes" value={formData.notes} onChange={handleInputChange} rows={2} />
          </div>
          <div className="neumorphic-form-group">
            <label className="neumorphic-label">Public Profile</label>
            <input type="checkbox" checked={formData.isPublic} onChange={handleSwitchChange} />
            <span style={{ marginLeft: 8 }}>{formData.isPublic ? 'Yes' : 'No'}</span>
          </div>
          <button className="neumorphic-btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
        {success && <div className="neumorphic-alert success">Profile saved successfully!</div>}
        {error && <div className="neumorphic-alert error">{error}</div>}
      </div>
    </div>
  );
};

export default ProfileForm; 