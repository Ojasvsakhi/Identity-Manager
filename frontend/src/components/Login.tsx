import React, { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, userService } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  const loginFormRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // TEMP: Mock users for debugging
  const [allUsers, setAllUsers] = useState<any[]>([]); // For debug
  const [showUsers, setShowUsers] = useState(false); // For debug

  // Fetch all users for debug
  React.useEffect(() => {
    userService.getAllUsers().then(setAllUsers).catch(() => {});
  }, []);

  // Dynamically adjust container height based on active form
  useLayoutEffect(() => {
    const activeRef = activeTab === 'login' ? loginFormRef : registerFormRef;
    if (activeRef.current) {
      setContainerHeight(activeRef.current.offsetHeight);
    }
  }, [activeTab, loading, registerData, loginData, error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: loginData.email });
      await login(loginData.email, loginData.password);
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = registerData;
      await authService.register(registrationData);
      setActiveTab('login'); // Switch to login tab after successful registration
      setError(null);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* DEBUG PANEL: Button and table together, fixed top left */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: '#f7f7fa',
          border: '1px solid #ccc',
          borderRadius: 8,
          boxShadow: '2px 2px 12px #bbb',
          padding: 12,
          minWidth: 220,
          maxWidth: 400,
          transition: 'box-shadow 0.2s',
        }}
      >
        <button
          type="button"
          style={{
            background: '#eee',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '6px 12px',
            cursor: 'pointer',
            boxShadow: '1px 1px 4px #bbb',
            width: '100%',
            marginBottom: showUsers ? 10 : 0,
            fontWeight: 600,
          }}
          onClick={() => setShowUsers((prev) => !prev)}
        >
          {showUsers ? 'Hide' : 'Show'} All Users (Debug)
        </button>
        {showUsers && (
          <div style={{ marginTop: 4, background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 8, maxHeight: 260, overflowY: 'auto' }}>
            <strong style={{ fontSize: 14 }}>Users (for debug):</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6, fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#eee' }}>
                  <th style={{ textAlign: 'left', padding: '2px 4px', border: '1px solid #ccc' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '2px 4px', border: '1px solid #ccc' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '2px 4px', border: '1px solid #ccc' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '2px 4px', border: '1px solid #ccc' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u, i) => (
                  <tr key={u.id || i}>
                    <td style={{ padding: '2px 4px', border: '1px solid #eee' }}>{u.name}</td>
                    <td style={{ padding: '2px 4px', border: '1px solid #eee' }}>{u.email}</td>
                    <td style={{ padding: '2px 4px', border: '1px solid #eee' }}>{u.username}</td>
                    <td style={{ padding: '2px 4px', border: '1px solid #eee' }}>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="container">
        {/* TEMP DEBUG BUTTON */}
        
        <div className="tabs">
          <button 
            className={activeTab === 'login' ? 'active' : ''}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Login/Register Forms with smooth transition */}
        <div
          style={{
            position: 'relative',
            height: containerHeight ? containerHeight + 60 : undefined, // add padding for tabs/buttons
            transition: 'height 0.4s cubic-bezier(.4,0,.2,1)',
            overflow: 'hidden',
          }}
        >
          <form
            ref={loginFormRef}
            id="loginForm"
            className={`form${activeTab === 'login' ? ' active' : ''}`}
            onSubmit={handleLogin}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: activeTab === 'login' ? 1 : 0,
              zIndex: activeTab === 'login' ? 2 : 1,
              pointerEvents: activeTab === 'login' ? 'auto' : 'none',
              transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1)'
            }}
          >
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              disabled={loading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              disabled={loading}
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <p className="or">Or continue with</p>
            <div className="socials">
              <button type="button" className="social">G</button>
              <button type="button" className="social">f</button>
              <button type="button" className="social">t</button>
            </div>
          </form>
          <form
            ref={registerFormRef}
            id="registerForm"
            className={`form${activeTab === 'register' ? ' active' : ''}`}
            onSubmit={handleRegister}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: activeTab === 'register' ? 1 : 0,
              zIndex: activeTab === 'register' ? 2 : 1,
              pointerEvents: activeTab === 'register' ? 'auto' : 'none',
              transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1)'
            }}
          >
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="Username" 
              required 
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              disabled={loading}
            />
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              disabled={loading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              disabled={loading}
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required 
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              disabled={loading}
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
            <p className="or">Or sign up with</p>
            <div className="socials">
              <button type="button" className="social">G</button>
              <button type="button" className="social">f</button>
              <button type="button" className="social">t</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 