import React from 'react';
import GoogleAuth from './GoogleAuth';
import './AuthButton.css';

const AuthButton = ({ onAuthSuccess, onAuthError }) => {
  const [userInfo, setUserInfo] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  const {
    isAuthenticated,
    loading,
    handleLogin,
    handleLogout,
    handleAuthCode,
    refreshAccessToken
  } = GoogleAuth({ 
    onAuthSuccess: (data) => {
      console.log('Auth success - userInfo:', data.userInfo);
      setUserInfo(data.userInfo);
      if (onAuthSuccess) onAuthSuccess(data);
    }, 
    onAuthError 
  });

  const handleLogoutClick = () => {
    handleLogout();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isAuthenticated) {
      handleAuthCode(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, handleAuthCode]);

  return (
    <div className="auth-button-container">
      {!isAuthenticated ? (
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="auth-button login-button"
        >
          {loading ? 'Connecting...' : 'Connect Google Calendar'}
        </button>
      ) : (
        <div className="auth-status">
          <div className="user-dropdown-container">
            {userInfo?.picture && (
              <img 
                src={userInfo.picture} 
                alt="Profile" 
                className="user-avatar clickable"
                onClick={toggleDropdown}
                onError={(e) => {
                  console.error('Failed to load profile picture:', userInfo.picture);
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Profile picture loaded successfully:', userInfo.picture);
                }}
              />
            )}
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-name">{userInfo?.name || 'User'}</div>
                  <div className="user-email">{userInfo?.email}</div>
                </div>
                <button 
                  onClick={handleLogoutClick}
                  className="dropdown-logout-button"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;