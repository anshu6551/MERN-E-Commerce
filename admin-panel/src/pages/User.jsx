import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, useTheme, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Avatar, CircularProgress, Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import TollIcon from '@mui/icons-material/Toll';
import { endpoints } from '../api/endpoints';

export default function User({ mode }) {
  const theme = useTheme();

  // 🔌 LIVE API STATES
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔔 TOAST SNACKBAR STATE CONTROL
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'info'
  });

  const showToast = (msg, type = 'success') => {
    setToast({
      open: true,
      message: String(msg),
      severity: type
    });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // 📡 1. FETCH ALL USERS
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await endpoints.users.getAllUsers();
      const resData = response?.data ? response.data : response;

      if (resData?.success) {
        setUsers(resData.users || []);
      }
    } catch (err) {
      console.error("Error fetching users ledger:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Users load karne mein dikkat aayi!";
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 📡 2. TOGGLE USER ACCESS STATUS
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    // 🔥 BROWSER PROMPT HATA DIYA: Click karte hi direct process chalega aur clean Snackbar dega!
    try {
      const response = await endpoints.users.updateUserStatus(id, nextStatus);
      const resData = response?.data ? response.data : response;

      if (resData?.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => user._id === id ? { ...user, status: nextStatus } : user)
        );
        // Asli MUI Snackbar notification yahaan trigger hogi:
        showToast(`User status successfully updated to ${nextStatus}! ✨`, 'success');
      }
    } catch (err) {
      console.error("Failed to change user status:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Status change failed!";
      showToast(errMsg, 'error'); // ❌ No browser alert here anymore!
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%', pb: 4 }}>
      
      {/* Page Title */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, color: theme.palette.text.primary, mb: 0.5, letterSpacing: '-1px' }}>
          Customer Management
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 500 }}>
          Audit user profile credentials, monitor gamified wallet assets, and control access permissions.
        </Typography>
      </Box>

      {/* Search Control */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <TextField
          fullWidth 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers by profile name or registration email..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff',
              borderRadius: '16px', 
              border: 'none',
              '& fieldset': { border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}` },
              '&:hover fieldset': { borderColor: '#06b6d4' },
              '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
            },
            input: { fontFamily: '"Plus Jakarta Sans"', color: theme.palette.text.primary, fontWeight: 500 }
          }}
        />
      </Box>

      {/* 📊 USER LEDGER TABLE */}
      <Card sx={{ bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', p: 3, width: '100%' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`, color: theme.palette.text.secondary, fontWeight: 800, fontFamily: '"Plus Jakarta Sans"', textTransform: 'uppercase', fontSize: '0.75rem' } }}>
                <TableCell>Customer Profile</TableCell>
                <TableCell>Coin Balance</TableCell>
                <TableCell>Cash Balance (₹)</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={30} sx={{ color: '#06b6d4' }} />
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user._id} 
                      component={motion.tr}
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      sx={{ '& td': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, color: theme.palette.text.primary, py: 2 } }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, fontSize: '0.9rem' }}>
                            {user.name ? user.name[0] : 'U'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</Typography>
                            <Typography variant="body2" sx={{ fontFamily: '"Plus Jakarta Sans"', color: theme.palette.text.secondary, fontSize: '0.85rem' }}>{user.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: '#eab308' }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          
                          {(user.coinBalance || 0).toLocaleString('en-IN')} Coins
                        </Box>
                      </TableCell>

                      <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                        ₹{(user.rupeeBalance || 0).toLocaleString('en-IN')}
                      </TableCell>

                      <TableCell>
                        <Chip 
                          label={(user.status || 'active').toUpperCase()}
                          size="small" 
                          sx={{ 
                            bgcolor: user.status === 'blocked' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: user.status === 'blocked' ? '#f43f5e' : '#10b981',
                            fontWeight: 700 
                          }} 
                        />
                      </TableCell>

                      <TableCell align="right">
                        <IconButton 
                          onClick={() => handleToggleStatus(user._id, user.status)}
                          sx={{ 
                            color: user.status === 'blocked' ? '#10b981' : '#f43f5e',
                            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`, 
                            borderRadius: '10px', p: 1 
                          }}
                        >
                          {user.status === 'blocked' ? <CheckIcon sx={{ fontSize: 18 }} /> : <BlockIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 🚀 REAL MATERIAL-UI TOAST SNACKBAR POPUP */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, borderRadius: '12px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}