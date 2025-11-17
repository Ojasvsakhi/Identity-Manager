import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Profile {
  id: string;
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
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export const profileService = {
  async getProfiles(): Promise<Profile[]> {
    const response = await api.get<Profile[]>('/profiles');
    return response.data;
  },

  async getProfile(id: string): Promise<Profile> {
    const response = await api.get<Profile>(`/profiles/${id}`);
    return response.data;
  },

  async createProfile(profileData: Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const response = await api.post<Profile>('/profiles', profileData);
    return response.data;
  },

  async updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
    const response = await api.put<Profile>(`/profiles/${id}`, profileData);
    return response.data;
  },

  async deleteProfile(id: string): Promise<void> {
    await api.delete(`/profiles/${id}`);
  },

  async getUserProfile(): Promise<Profile> {
    const response = await api.get<Profile>('/profiles/user');
    return response.data;
  },

  async updateUserProfile(profileData: Partial<Profile>) {
    const response = await api.put<Profile>('/profiles/user', profileData);
    return response.data;
  }
};

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async register(userData: { username: string; email: string; password: string; name: string }) {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Registration failed';
        console.error('Registration error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message
        });
        throw new Error(message);
      }
      throw error;
    }
  },

  async login(credentials: { email: string; password: string }) {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await api.post<AuthResponse>('/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      } else {
        throw new Error('No token received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      if (axios.isAxiosError(error)) {
        // Extract the most specific error message available
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Login failed';
        
        console.error('Login error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage
        });
        throw new Error(errorMessage);
      }
      throw new Error('An unexpected error occurred during login');
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getProfile() {
    try {
      const response = await api.get<User>('/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        console.error('Get profile error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message
        });
        throw new Error(message);
      }
      throw error;
    }
  }
}; 

export const userService = {
  async getCurrentUser() {
    const response = await api.get<{ user: User }>('/profile');
    return response.data.user;
  },

  async updateSettings(settings: { name?: string; email?: string; username?: string }): Promise<{ message: string; user: User }> {
    const response = await api.put<{ message: string; user: User }>('/settings', settings);
    return response.data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/password', { currentPassword, newPassword });
    return response.data;
  },

  async deleteAccount(password: string) {
    const response = await api.delete('/account', { data: { password } });
    return response.data;
  },

  // DEBUG: Get all users (no passwords)
  async getAllUsers() {
    const response = await api.get('/all');
    return response.data;
  }
}; 