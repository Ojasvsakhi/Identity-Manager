import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProfileList from './components/ProfileList';
import ProfileForm from './components/ProfileForm';
import ProfileView from './components/ProfileView';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileService } from './services/api';
import Analysis from './components/Analysis';
import MessageForm from './components/MessageForm';
import MessageInbox from './components/MessageInbox';
import BookmarkedProfiles from './components/BookmarkedProfiles';
import Settings from './components/Settings';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="App">
      {isAuthenticated && <Navbar onLogout={logout} />}
      <main style={{ flex: 1, padding: '20px', position: 'relative', minHeight: 400 }}>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={location.pathname}
            classNames="fade-page"
            timeout={400}
            unmountOnExit
          >
            <div style={{ width: '100%', height: '100%' }}>
              <Routes location={location}>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profiles"
                  element={
                    <ProtectedRoute>
                      <ProfileList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profiles/new"
                  element={
                    <ProtectedRoute>
                      <ProfileForm onSubmit={async (data) => {
                        try {
                          await profileService.createProfile(data);
                          navigate('/profiles');
                        } catch (error) {
                          console.error('Error creating profile:', error);
                        }
                      }} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profiles/:id"
                  element={
                    <ProtectedRoute>
                      <ProfileView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profiles/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ProfileForm onSubmit={async (data) => {
                        try {
                          const id = window.location.pathname.split('/').pop();
                          if (id) {
                            await profileService.updateProfile(id, data);
                            navigate('/profiles');
                          }
                        } catch (error) {
                          console.error('Error updating profile:', error);
                        }
                      }} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analysis"
                  element={
                    <ProtectedRoute>
                      <Analysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/create"
                  element={
                    <ProtectedRoute>
                      <ProfileForm onSubmit={async (data) => {
                        try {
                          await profileService.createProfile(data);
                          navigate('/profiles');
                        } catch (error) {
                          console.error('Error creating profile:', error);
                        }
                      }} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ProfileForm onSubmit={async (data) => {
                        try {
                          const id = window.location.pathname.split('/').pop();
                          if (id) {
                            await profileService.updateProfile(id, data);
                            navigate('/profiles');
                          }
                        } catch (error) {
                          console.error('Error updating profile:', error);
                        }
                      }} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/message/:id"
                  element={
                    <ProtectedRoute>
                      <MessageForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessageInbox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <BookmarkedProfiles />
                    </ProtectedRoute>
                  }
                />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </CSSTransition>
        </SwitchTransition>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 