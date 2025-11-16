import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Snackbar, Paper } from '@mui/material';
import axios from 'axios';

const MessageForm: React.FC = () => {
  const { id: recipientProfileId } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/send-message',
        { recipientProfileId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Message sent successfully!');
      setContent('');
      setTimeout(() => navigate('/profiles/' + recipientProfileId), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>Send Message</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Message"
          value={content}
          onChange={e => setContent(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default MessageForm; 