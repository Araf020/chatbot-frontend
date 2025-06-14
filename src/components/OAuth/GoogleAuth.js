import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/oauth/callback';
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

const GoogleAuth = ({ onAuthSuccess, onAuthError }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingAuth();
    loadGoogleAPI();
  }, []);

  const loadGoogleAPI = () => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  };

  const checkExistingAuth = () => {
    const accessToken = localStorage.getItem('google_access_token');
    const refreshToken = localStorage.getItem('google_refresh_token');
    const userInfoStr = localStorage.getItem('google_user_info');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    
    if (accessToken && refreshToken) {
      setIsAuthenticated(true);
      if (onAuthSuccess) {
        onAuthSuccess({ accessToken, refreshToken, userInfo });
      }
    }
  };

  const generateAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleLogin = () => {
    setLoading(true);
    const url = generateAuthUrl();
    window.location.href = url;
  };

  const handleAuthCode = async (code) => {
    try {
      setLoading(true);
      
      // Exchange code for tokens via backend
      const response = await axios.post(`${BACKEND_API_URL}/api/auth/google`, {
        code,
        redirect_uri: REDIRECT_URI
      });

      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('google_access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('google_refresh_token', refresh_token);
      }

      // Fetch user info
      const userInfo = await fetchUserInfo(access_token);
      localStorage.setItem('google_user_info', JSON.stringify(userInfo));

      setIsAuthenticated(true);
      
      if (onAuthSuccess) {
        onAuthSuccess({
          accessToken: access_token,
          refreshToken: refresh_token,
          userInfo: userInfo
        });
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      if (onAuthError) {
        onAuthError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_user_info');
    setIsAuthenticated(false);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('google_refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post(`${BACKEND_API_URL}/api/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token } = response.data;
      localStorage.setItem('google_access_token', access_token);
      
      return access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
      throw error;
    }
  };

  return {
    isAuthenticated,
    loading,
    handleLogin,
    handleLogout,
    handleAuthCode,
    refreshAccessToken,
    generateAuthUrl
  };
};

export default GoogleAuth;