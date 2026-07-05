import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, InputAdornment, useTheme, Link, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { endpoints } from '../api/endpoints'; // Assuming you have a route for OTP verification

export default function VerifyOtp({ mode, setAuthView, temporaryEmail }) {
  const theme = useTheme();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 📡 Send OTP and email to backend pipeline
      // Replace with your exact endpoint structure (e.g., endpoints.auth.verifyOtp)
      await endpoints.auth.verifyOtp({ email: temporaryEmail, otp });

      setSnackbar({
        open: true,
        message: "Account verified successfully! Redirecting to portal authorization... 🚀",
        severity: 'success'
      });

      // Redirect to login view after a brief moment
      setTimeout(() => {
        setAuthView('login');
      }, 1500);

    } catch (err) {
      console.error("OTP verification failed:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid or Expired OTP matrix code! ❌",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: mode === 'dark' ? '#02040a' : '#f1f5f9', px: { xs: 2, sm: 4 }, py: 4, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* 🌌 ANIMATED MESH LIGHTS */}
      <Box component={motion.div} animate={{ x: [0, 40, -20, 0], y: [0, -50, 30, 0], scale: [1, 1.1, 0.95, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} sx={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0) 70%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }} />

      {/* 🖥️ CONTAINER METRIC CARD */}
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        sx={{ width: '100%', maxWidth: '420px', p: 4, borderRadius: '28px', bgcolor: mode === 'dark' ? 'rgba(10, 15, 30, 0.72)' : 'rgba(255, 255, 255, 0.88)', border: `1px solid ${mode === 'dark' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(6, 182, 212, 0.22)'}`, backdropFilter: 'blur(24px)', boxShadow: mode === 'dark' ? '0 30px 70px rgba(0,0,0,0.85)' : '0 20px 45px rgba(0,0,0,0.06)', zIndex: 1, position: 'relative' }}
      >
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, color: '#06b6d4', mb: 1, letterSpacing: '-0.5px' }}>
            VERIFY MATRIX
          </Typography>
          <Typography sx={{ fontFamily: '"Plus Jakarta Sans"', color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.88rem' }}>
            Enter the secure access node code sent to your terminal.
          </Typography>
        </Box>

        <form onSubmit={handleVerify}>
          <Box>
            <TextField
              label="One-Time Password (OTP)" required fullWidth type="text"
              inputProps={{ maxLength: 6, style: { letterSpacing: '6px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 } }}
              value={otp} onChange={(e) => setOtp(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><VpnKeyIcon sx={{ color: '#06b6d4', fontSize: 20 }} /></InputAdornment>
              }}
              sx={{ mb: 4 }} 
            />

            <Button
              type="submit" variant="contained" disabled={loading || otp.length < 4}
              sx={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', textTransform: 'none', borderRadius: '14px', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, py: 1.6, fontSize: '0.95rem', boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)', mb: 2 }}
            >
              {loading ? 'Decrypting Code...' : 'Authorize Verification'}
            </Button>
          </Box>
        </form>

        <Box textAlign="center" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontFamily: '"Plus Jakarta Sans"', color: theme.palette.text.secondary, fontWeight: 500 }}>
            Wrong terminal account?{' '}
            <Link component="button" onClick={() => setAuthView('register')} sx={{ color: '#06b6d4', fontWeight: 700, textDecoration: 'none' }}>
              Back to Registration
            </Link>
          </Typography>
        </Box>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontFamily: '"Plus Jakarta Sans"', borderRadius: '10px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}