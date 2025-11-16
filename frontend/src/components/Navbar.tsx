import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', path: '/' },
    { text: 'Profiles', path: '/profiles' },
    { text: 'Analysis', path: '/analysis' },
    { text: 'Messages', path: '/messages' },
    { text: 'Bookmarks', path: '/bookmarks' },
    { text: 'Settings', path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="neumorphic-nav">
        <div className="nav-content">
          <button 
            className="nav-menu-btn"
            onClick={handleDrawerToggle}
            aria-label="Open menu"
          >
            ☰
          </button>
          
          <Link to="/" className="nav-brand">
            Profile Manager
          </Link>
          
          <div className="nav-actions">
            <button 
              className="nav-profile-btn"
              onClick={() => navigate('/profile')}
              aria-label="User profile"
            >
              👤
            </button>
            <button 
              className="nav-logout-btn"
              onClick={handleLogoutClick}
              aria-label="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`nav-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="drawer-overlay" onClick={handleDrawerToggle}></div>
        <div className="drawer-content">
          <div className="drawer-header">
            <h3>Menu</h3>
            <button 
              className="drawer-close-btn"
              onClick={handleDrawerToggle}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          
          <nav className="drawer-nav">
            {menuItems.map((item) => (
              <Link
                key={item.text}
                to={item.path}
                className={`drawer-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={handleDrawerToggle}
              >
                {item.text}
              </Link>
            ))}
            
            <div className="drawer-divider"></div>
            
            <button 
              className="drawer-nav-item drawer-logout-btn"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {logoutDialogOpen && (
        <div className="neumorphic-modal">
          <div className="neumorphic-modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button 
                className="neumorphic-btn"
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className="neumorphic-btn primary"
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 