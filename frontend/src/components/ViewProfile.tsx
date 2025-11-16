import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { profileService, Profile } from '../services/api';
import LockIcon from '@mui/icons-material/Lock';

const ViewProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile(id!);
      setProfile(data);
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Profile not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4">
              {profile.name}
            </Typography>
            {!profile.isPublic && (
              <Chip
                icon={<LockIcon />}
                label="Private Profile"
                color="error"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/profiles')}
          >
            Back to Profiles
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary">
              {profile.role}
            </Typography>
            {profile.location && (
              <Typography variant="body1" color="text.secondary">
                📍 {profile.location}
              </Typography>
            )}
          </Grid>

          {profile.isPublic ? (
            <>
              {profile.bio && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      About
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {profile.bio}
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                {profile.email && (
                  <Typography variant="body1" paragraph>
                    📧 {profile.email}
                  </Typography>
                )}
                {profile.phoneNumber && (
                  <Typography variant="body1" paragraph>
                    📱 {profile.phoneNumber}
                  </Typography>
                )}
                {profile.website && (
                  <Typography variant="body1" paragraph>
                    🌐 {profile.website}
                  </Typography>
                )}
                {profile.socialLinks && (
                  <Typography variant="body1" paragraph>
                    🔗 {profile.socialLinks}
                  </Typography>
                )}
              </Grid>

              {profile.skills && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {profile.skills}
                  </Typography>
                </Grid>
              )}

              {profile.experience && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Experience
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {profile.experience}
                  </Typography>
                </Grid>
              )}

              {profile.education && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Education
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {profile.education}
                  </Typography>
                </Grid>
              )}
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                This is a private profile. Only basic information is available.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViewProfile; 