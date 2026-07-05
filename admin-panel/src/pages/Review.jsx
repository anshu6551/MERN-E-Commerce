import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, useTheme, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton, Rating
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { endpoints } from '../api/endpoints';

export default function Reviews({ mode }) {
  const theme = useTheme();

  // 🔌 LIVE API STATES
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 📡 1. GET ALL REVIEWS FROM LIVE BACKEND
  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Agar endpoints.js mein aapne naam getAllReveiews rakha hai toh vahi trigger hoga
      const response = await endpoints.reviews.getAllReveiews(); 
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 📡 2. APPROVE REVIEW ACTION
  const handleApprove = async (id) => {
    try {
      // TODO: Jab backend par update status API ready ho jaye:
      // await endpoints.reviews.updateStatus(id, 'Approved');
      setReviews(reviews.map(rev => rev._id === id ? { ...rev, status: 'Approved' } : rev));
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  // 📡 3. REJECT REVIEW ACTION
  const handleReject = async (id) => {
    try {
      // TODO: Jab backend par update status API ready ho jaye:
      // await endpoints.reviews.updateStatus(id, 'Rejected');
      setReviews(reviews.map(rev => rev._id === id ? { ...rev, status: 'Rejected' } : rev));
    } catch (err) {
      console.error("Rejection failed:", err);
    }
  };

  // 🔍 Mongoose nested paths (productId.title aur adminId.name) ke hisab se search filter
  const filteredReviews = reviews.filter(review => {
    const productName = review.productId?.title || '';
    const customerName = review.adminId?.name || '';
    const commentText = review.comment || '';

    return productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           commentText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Dynamic Badges for Review Moderation Status
  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Approved" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700 }} />;
      case 'Rejected':
        return <Chip label="Rejected" size="small" sx={{ bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', fontWeight: 700 }} />;
      case 'Pending':
      default:
        return <Chip label={status || "Pending"} size="small" sx={{ bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', fontWeight: 700 }} />;
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%', pb: 4 }}>
      
      {/* Page Title Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, color: theme.palette.text.primary, mb: 0.5, letterSpacing: '-1px' }}>
          Customer Reviews
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 500 }}>
          Monitor product feedback, moderate review status, and evaluate customer sentiment.
        </Typography>
      </Box>

      {/* Modern Search Input Control */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reviews by product name, client name or keyword phrases..."
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
              '&.Mui-focused fieldset': { borderColor: '#06b6d4', borderWidth: '1px' },
            },
            input: { fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.primary, fontWeight: 500 }
          }}
        />
      </Box>

      {/* 📊 ADVANCED REVIEWS LEDGER TABLE */}
      <Card sx={{ bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', p: 3, width: '100%', boxShadow: mode === 'dark' ? 'none' : '0 10px 30px rgba(0,0,0,0.02)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`, color: theme.palette.text.secondary, fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' } }}>
                <TableCell>Product / Reviewer</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell sx={{ width: '40%' }}>Comment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, fontFamily: '"Plus Jakarta Sans"' }}>
                      Loading your data from backend...
                    </TableCell>
                  </TableRow>
                ) : filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, fontFamily: '"Plus Jakarta Sans"' }}>
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow 
                      key={review._id} 
                      component={motion.tr}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      sx={{ '& td': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, color: theme.palette.text.primary, py: 2.5 } }}
                    >
                      {/* Product Title & Reviewer Name fields aligned with Mongoose schema populate */}
                      <TableCell>
                        <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>
                          {review.productId?.title || "Deleted Product"}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 500 }}>
                          by {review.adminId?.name || "Anonymous"}
                        </Typography>
                      </TableCell>

                      {/* Star Rating */}
                      <TableCell>
                        <Rating value={review.rating} readOnly size="small" sx={{ color: '#eab308' }} />
                      </TableCell>

                      {/* Comment Context */}
                      <TableCell sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '0.9rem', color: theme.palette.text.primary, fontWeight: 500 }}>
                        "{review.comment}"
                      </TableCell>

                      {/* Dynamic Date format parsing from Mongoose timestamps */}
                      <TableCell sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 500, color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}>
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : "N/A"}
                      </TableCell>

                      {/* Verification Status */}
                      <TableCell>{getStatusChip(review.status)}</TableCell>

                      {/* Action controls (Approve / Reject) */}
                      <TableCell align="right">
                        {!review.status || review.status === 'Pending' ? (
                          <Box display="flex" justifyContent="flex-end" gap={1}>
                            <IconButton 
                              onClick={() => handleApprove(review._id)}
                              sx={{ color: '#10b981', border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '10px', p: 1 }}
                            >
                              <CheckIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleReject(review._id)}
                              sx={{ color: '#f43f5e', border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '10px', p: 1 }}
                            >
                              <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ fontFamily: '"Plus Jakarta Sans"', color: theme.palette.text.secondary, pr: 1 }}>
                            Moderated
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}