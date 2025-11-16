import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  name: string;
  age: string;
  gender: string;
  education: string;
  occupation: string;
  location: string;
}

const BookmarkedProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarkedProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfiles(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch bookmarked profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarkedProfiles();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>Bookmarked Profiles</Typography>
      <List>
        {profiles.map((profile) => (
          <React.Fragment key={profile.id}>
            <ListItem
              secondaryAction={
                <Button variant="outlined" onClick={() => navigate(`/profiles/${profile.id}`)}>
                  View Profile
                </Button>
              }
            >
              <ListItemText
                primary={profile.name}
                secondary={`Age: ${profile.age}, Gender: ${profile.gender}, Education: ${profile.education}, Occupation: ${profile.occupation}, Location: ${profile.location}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default BookmarkedProfiles; 