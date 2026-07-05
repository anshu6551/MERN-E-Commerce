import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';
import DashboardLayout from './layouts/DashBoardLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Product';
import Orders from './pages/Order';
import Reviews from './pages/Review';
import User from './pages/User';
import WalletSettings from './pages/WalletSetting';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp'; // 1. Imported the OTP Verification component

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [mode, setMode] = useState('dark'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [authView, setAuthView] = useState('login'); // Supports 'login' | 'register' | 'verify_otp'
  const [temporaryEmail, setTemporaryEmail] = useState(''); // 2. Stores email context between Registration and OTP screens
  const [checkingAuth, setCheckingAuth] = useState(true);

  /**
   * Hook to automatically detect valid user tokens on initialization
   */
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token'); 
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setCheckingAuth(false);
    };
    checkToken();
  }, []);

  /**
   * Material-UI Custom Design Theme Provider Configurations
   */
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#06b6d4' },
      background: {
        default: mode === 'dark' ? '#040711' : '#f8fafc',
        paper: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      },
      text: {
        primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
        secondary: mode === 'dark' ? '#64748b' : '#475569',
      }
    },
    typography: { fontFamily: 'Inter, sans-serif' }
  }), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  /**
   * Renders the corresponding internal panel component based on active page state
   */
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard mode={mode} />;
      case 'products': return <Products mode={mode} />;
      case 'orders': return <Orders mode={mode} />;
      case 'reviews': return <Reviews mode={mode} />;
      case 'users': return <User mode={mode} />;
      case 'wallet_settings': return <WalletSettings mode={mode} />;
      default: return <Dashboard mode={mode} />;
    }
  };

  /**
   * Conditional layout handler managing unauthenticated state routing views
   */
  const renderAuthViews = () => {
    switch (authView) {
      case 'login':
        return <Login mode={mode} setAuth={setIsAuthenticated} setAuthView={setAuthView} />;
      case 'register':
        return <Register mode={mode} setAuthView={setAuthView} setTemporaryEmail={setTemporaryEmail} />; 
      case 'verify_otp':
        return <VerifyOtp mode={mode} setAuthView={setAuthView} temporaryEmail={temporaryEmail} />; 
      default:
        return <Login mode={mode} setAuth={setIsAuthenticated} setAuthView={setAuthView} />;
    }
  };

  if (checkingAuth) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: mode === 'dark' ? '#040711' : '#f8fafc' }}>
          <Typography sx={{ fontFamily: '"Space Grotesk"', color: '#06b6d4', fontWeight: 700, letterSpacing: '1px' }}>
            SCANNING SECURITY TOKENS...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated ? (
        renderAuthViews() // Dynamic switcher for Auth sub-views
      ) : (
        <DashboardLayout activePage={activePage} setActivePage={setActivePage} mode={mode} toggleTheme={toggleTheme} setAuth={setIsAuthenticated}>
          {renderPage()}
        </DashboardLayout>
      )}
    </ThemeProvider>
  );
}