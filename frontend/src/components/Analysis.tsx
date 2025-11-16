import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Profile } from '../services/api';
import { profileService } from '../services/api';
import './Analysis.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

type SortField = 'name' | 'age' | 'gender' | 'maritalStatus' | 'education';
type SortOrder = 'asc' | 'desc';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analysis: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [maritalStatusFilter, setMaritalStatusFilter] = useState('');
  const [educationTypeFilter, setEducationTypeFilter] = useState('');
  // Sort states
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const fetchProfiles = async () => {
    try {
      const data = await profileService.getProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      setError('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    let filtered = [...profiles];
    if (nameFilter) {
      filtered = filtered.filter(profile => profile.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (ageFilter) {
      filtered = filtered.filter(profile => profile.age.includes(ageFilter));
    }
    if (genderFilter) {
      filtered = filtered.filter(profile => profile.gender.toLowerCase() === genderFilter.toLowerCase());
    }
    if (maritalStatusFilter) {
      filtered = filtered.filter(profile => profile.maritalStatus.toLowerCase() === maritalStatusFilter.toLowerCase());
    }
    if (educationTypeFilter) {
      filtered = filtered.filter(profile => {
        const education = profile.education.toLowerCase();
        if (educationTypeFilter === 'public') {
          return education.includes('university') || education.includes('institute') || education.includes('college');
        } else if (educationTypeFilter === 'private') {
          return education.includes('private') || education.includes('deemed');
        }
        return true;
      });
    }
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'age') {
        comparison = parseInt(a.age) - parseInt(b.age);
      } else {
        comparison = a[sortField].toLowerCase().localeCompare(b[sortField].toLowerCase());
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    setFilteredProfiles(filtered);
  }, [profiles, nameFilter, ageFilter, genderFilter, maritalStatusFilter, educationTypeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  const handleReset = () => {
    setNameFilter('');
    setAgeFilter('');
    setGenderFilter('');
    setMaritalStatusFilter('');
    setEducationTypeFilter('');
    setSortField('name');
    setSortOrder('asc');
  };

  // Prepare data for charts
  const genderData = filteredProfiles.reduce((acc: any[], profile) => {
    const existing = acc.find(item => item.name === profile.gender);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: profile.gender, value: 1 });
    }
    return acc;
  }, []);

  const maritalStatusData = filteredProfiles.reduce((acc: any[], profile) => {
    const existing = acc.find(item => item.name === profile.maritalStatus);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: profile.maritalStatus, value: 1 });
    }
    return acc;
  }, []);

  const educationData = filteredProfiles.reduce((acc: any[], profile) => {
    const existing = acc.find(item => item.name === profile.education);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: profile.education, value: 1 });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="neumorphic-alert error">{error}</div>;
  }

  return (
    <div className="analysis-container">
      <div className="neumorphic-container">
        <h2 className="text-center">Profile Analysis</h2>
        <button className="neumorphic-btn" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <CSSTransition
          in={showFilters}
          timeout={400}
          classNames="fade-slide"
          unmountOnExit
        >
          <div className="analysis-filters">
            <input className="neumorphic-input" placeholder="Name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} />
            <input className="neumorphic-input" placeholder="Age" value={ageFilter} onChange={e => setAgeFilter(e.target.value)} />
            <input className="neumorphic-input" placeholder="Gender" value={genderFilter} onChange={e => setGenderFilter(e.target.value)} />
            <input className="neumorphic-input" placeholder="Marital Status" value={maritalStatusFilter} onChange={e => setMaritalStatusFilter(e.target.value)} />
            <select className="neumorphic-input" value={educationTypeFilter} onChange={e => setEducationTypeFilter(e.target.value)}>
              <option value="">All Education Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <button className="neumorphic-btn" onClick={handleReset}>Reset</button>
          </div>
        </CSSTransition>
        <TransitionGroup className="analysis-charts">
          <CSSTransition key="gender" timeout={400} classNames="fade-slide">
            <div className="neumorphic-card analysis-card">
              <h3>Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-gender-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CSSTransition>
          <CSSTransition key="marital" timeout={400} classNames="fade-slide">
            <div className="neumorphic-card analysis-card">
              <h3>Marital Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={maritalStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {maritalStatusData.map((entry, index) => (
                      <Cell key={`cell-marital-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CSSTransition>
          <CSSTransition key="education" timeout={400} classNames="fade-slide">
            <div className="neumorphic-card analysis-card">
              <h3>Education Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={educationData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4a90e2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CSSTransition>
        </TransitionGroup>
        <CSSTransition in={true} appear={true} timeout={400} classNames="fade-slide">
          <div className="neumorphic-card analysis-table-card">
            <h3>Profiles Table</h3>
            <div className="analysis-table-wrapper">
              <table className="neumorphic-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('age')}>Age {sortField === 'age' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('gender')}>Gender {sortField === 'gender' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('maritalStatus')}>Marital Status {sortField === 'maritalStatus' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('education')}>Education {sortField === 'education' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map(profile => (
                    <tr key={profile.id}>
                      <td>{profile.name}</td>
                      <td>{profile.age}</td>
                      <td>{profile.gender}</td>
                      <td>{profile.maritalStatus}</td>
                      <td>{profile.education}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

export default Analysis; 