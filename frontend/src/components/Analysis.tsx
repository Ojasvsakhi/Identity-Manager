import React, { useState, useEffect, useMemo } from 'react';
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

type SortField = 'name' | 'age' | 'gender' | 'education' | 'location';
type SortOrder = 'asc' | 'desc';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const categorizeEducation = (education?: string) => {
  if (!education) {
    return 'Not specified';
  }

  const normalized = education.toLowerCase();

  if (normalized.includes('phd') || normalized.includes('doctor')) {
    return 'Doctorate';
  }
  if (
    normalized.includes('mba') ||
    normalized.includes('master') ||
    normalized.includes('m.') ||
    normalized.includes('msc') ||
    normalized.includes('mtech') ||
    normalized.includes('m.tech')
  ) {
    return 'Postgraduate';
  }
  if (
    normalized.includes('bachelor') ||
    normalized.includes('b.') ||
    normalized.includes('btech') ||
    normalized.includes('b.tech') ||
    normalized.includes('be') ||
    normalized.includes('b.e')
  ) {
    return 'Undergraduate';
  }
  if (normalized.includes('diploma') || normalized.includes('certificate')) {
    return 'Diploma / Certification';
  }
  if (
    normalized.includes('school') ||
    normalized.includes('high school') ||
    normalized.includes('secondary')
  ) {
    return 'School';
  }

  return 'Other';
};

const aggregateByCategory = (profiles: Profile[], extractor: (profile: Profile) => string) => {
  const data = profiles.reduce<{ [key: string]: number }>((acc, profile) => {
    const key = extractor(profile);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const AGE_BUCKET_LABELS = ['18-24', '25-34', '35-44', '45-54', '55+', 'Unknown'] as const;
type AgeBucket = (typeof AGE_BUCKET_LABELS)[number];

const getAgeBucket = (age?: string): AgeBucket => {
  const parsed = parseInt(age || '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 'Unknown';
  }
  if (parsed < 25) return '18-24';
  if (parsed < 35) return '25-34';
  if (parsed < 45) return '35-44';
  if (parsed < 55) return '45-54';
  return '55+';
};

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
  const [locationFilter, setLocationFilter] = useState('');
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
    if (locationFilter) {
      filtered = filtered.filter(profile => (profile.location || '').toLowerCase().includes(locationFilter.toLowerCase()));
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
        const ageA = parseInt(a.age) || 0;
        const ageB = parseInt(b.age) || 0;
        comparison = ageA - ageB;
      } else {
        const field = sortField as Exclude<SortField, 'age'>;
        const valueA = (a[field] || '').toLowerCase();
        const valueB = (b[field] || '').toLowerCase();
        comparison = valueA.localeCompare(valueB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    setFilteredProfiles(filtered);
  }, [profiles, nameFilter, ageFilter, genderFilter, locationFilter, educationTypeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  const handleReset = () => {
    setNameFilter('');
    setAgeFilter('');
    setGenderFilter('');
    setLocationFilter('');
    setEducationTypeFilter('');
    setSortField('name');
    setSortOrder('asc');
  };

  // Prepare data for charts
  const genderData = aggregateByCategory(filteredProfiles, (profile) => profile.gender);

  const educationData = aggregateByCategory(filteredProfiles, (profile) => categorizeEducation(profile.education));

  const visibilityData = useMemo(() => {
    const publicCount = filteredProfiles.filter(profile => profile.isPublic).length;
    const privateCount = filteredProfiles.length - publicCount;
    return [
      { name: 'Public Profiles', value: publicCount },
      { name: 'Private Profiles', value: privateCount }
    ];
  }, [filteredProfiles]);

  const locationData = useMemo(() => {
    const aggregated = aggregateByCategory(filteredProfiles, (profile) => (profile.location?.trim() || 'Not specified'));
    return aggregated.slice(0, 5);
  }, [filteredProfiles]);

  const ageDistributionData = useMemo(() => {
    const counts: Record<AgeBucket, number> = AGE_BUCKET_LABELS.reduce((acc, label) => {
      acc[label] = 0;
      return acc;
    }, {} as Record<AgeBucket, number>);

    filteredProfiles.forEach(profile => {
      const bucket = getAgeBucket(profile.age);
      counts[bucket] += 1;
    });

    return AGE_BUCKET_LABELS.map(label => ({ name: label, value: counts[label] }));
  }, [filteredProfiles]);

  const summaryMetrics = useMemo(() => {
    const totalProfiles = filteredProfiles.length;
    const publicProfiles = filteredProfiles.filter(profile => profile.isPublic).length;
    const numericAges = filteredProfiles
      .map(profile => parseInt(profile.age, 10))
      .filter(age => !Number.isNaN(age) && age > 0);
    const averageAge = numericAges.length
      ? Math.round(numericAges.reduce((sum, age) => sum + age, 0) / numericAges.length)
      : null;

    return [
      { label: 'Total Profiles', value: totalProfiles.toString() },
      { label: 'Public Profiles', value: `${publicProfiles} (${totalProfiles ? Math.round((publicProfiles / totalProfiles) * 100) : 0}%)` },
      { label: 'Average Age', value: averageAge ? `${averageAge} yrs` : 'Not enough data' }
    ];
  }, [filteredProfiles]);

  const derivedInsights = useMemo(() => {
    const insights: string[] = [];
    if (educationData[0]) {
      insights.push(`Most common education track: ${educationData[0].name}`);
    }
    if (locationData[0]) {
      insights.push(`Top talent hub: ${locationData[0].name}`);
    }
    const publicShare = visibilityData[0]?.value || 0;
    const total = filteredProfiles.length || 1;
    insights.push(`Visibility: ${Math.round((publicShare / total) * 100)}% profiles are public`);
    return insights;
  }, [educationData, locationData, visibilityData, filteredProfiles.length]);

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
            <input className="neumorphic-input" placeholder="Location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            <select className="neumorphic-input" value={educationTypeFilter} onChange={e => setEducationTypeFilter(e.target.value)}>
              <option value="">All Education Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <button className="neumorphic-btn" onClick={handleReset}>Reset</button>
          </div>
        </CSSTransition>
        <div className="analysis-metrics-grid">
          {summaryMetrics.map(metric => (
            <div key={metric.label} className="analysis-metric-card">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
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
          <CSSTransition key="age" timeout={400} classNames="fade-slide">
            <div className="neumorphic-card analysis-card">
              <h3>Age Buckets</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageDistributionData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#ff8a65" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CSSTransition>
          <CSSTransition key="visibility" timeout={400} classNames="fade-slide">
            <div className="neumorphic-card analysis-card">
              <h3>Visibility Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={visibilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {visibilityData.map((entry, index) => (
                      <Cell key={`cell-visibility-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CSSTransition>
          <CSSTransition key="locations" timeout={400} classNames="fade-slide">
            <div className="neumorphic-card analysis-card">
              <h3>Top Locations</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={locationData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#4db6ac" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CSSTransition>
        </TransitionGroup>
        <div className="analysis-insights">
          <h3>Insights</h3>
          <ul>
            {derivedInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
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
                    <th onClick={() => handleSort('location')}>Location {sortField === 'location' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('education')}>Education {sortField === 'education' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map(profile => (
                    <tr key={profile.id}>
                      <td>{profile.name}</td>
                      <td>{profile.age}</td>
                      <td>{profile.gender}</td>
                      <td>{profile.location || 'Not specified'}</td>
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