import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import PaidIcon from '@mui/icons-material/Paid';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';
import { endpoints } from '../api/endpoints';

export default function Dashboard({ mode }) {
  const theme = useTheme();
  
  // 🔌 Dynamic Core Live States
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [backendStats, setBackendStats] = useState({ 
    totalRevenue: '0', 
    totalProducts: '0', 
    walletCoins: '12,450', // System metadata configs ke liye static fallback
    avgRating: '0.0' 
  });

  /**
   * 📡 Dynamic API Aggregation Pipeline
   */
  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Trigger parallel API streams
      const [productsResponse, ordersResponse, reviewsResponse] = await Promise.all([
        endpoints.products.getAll(),
        endpoints.orders.getAll(),
        endpoints.reviews.getAllReveiews()
      ]);

      // JSON parsing mappings matching your response structure precisely
      const productsList = productsResponse.data?.data || [];
      const ordersList = ordersResponse.data?.data || [];
      const reviewsList = reviewsResponse.data?.reviews || []; // Matches 'reviews' object array template

      // 💰 1. Total Revenue Calculation Loop (Using 'totalAmount')
      const dynamicRevenueSum = ordersList.reduce((acc, order) => {
        return acc + (Number(order.totalAmount) || 0);
      }, 0);

      // ⭐ 2. Mathematical Average Rating Parser Loop
      let parsedAvgRating = '0.0';
      if (reviewsList.length > 0) {
        const totalRatingScore = reviewsList.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
        parsedAvgRating = (totalRatingScore / reviewsList.length).toFixed(1);
      }

      // 📊 3. Dynamic Recharts Day Alignment Engine
      const dayMapping = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
      
      ordersList.forEach(order => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt);
          const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' }); // Returns 'Mon', 'Tue'...
          
          if (dayMapping[dayName] !== undefined) {
            dayMapping[dayName] += (Number(order.totalAmount) || 0);
          }
        }
      });

      const formattedChartArray = Object.keys(dayMapping).map(day => ({
        name: day,
        revenue: dayMapping[day]
      }));

      // Commit dynamic states
      setBackendStats({
        totalRevenue: dynamicRevenueSum.toLocaleString('en-IN'),
        totalProducts: String(productsList.length),
        walletCoins: '12,450',
        avgRating: parsedAvgRating
      });

      setChartData(formattedChartArray);
      setRecentOrders(ordersList.slice(0, 5)); // Extracted top 5 recent entries for layout protection

    } catch (err) {
      console.error("Dashboard metric tracking pipeline crashed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const stats = [
    { title: 'TOTAL REVENUE', value: `₹${backendStats.totalRevenue}`, icon: <PaidIcon sx={{ fontSize: 22, color: '#10b981' }} />, bg: 'rgba(16, 185, 129, 0.08)' },
    { title: 'TOTAL PRODUCTS', value: `${backendStats.totalProducts} Items`, icon: <ShoppingBagIcon sx={{ fontSize: 22, color: '#38bdf8' }} />, bg: 'rgba(56, 189, 248, 0.08)' },
    { title: 'WALLET COINS', value: `${backendStats.walletCoins} 🪙`, icon: <AccountBalanceWalletIcon sx={{ fontSize: 22, color: '#eab308' }} />, bg: 'rgba(234, 179, 8, 0.08)' },
    { title: 'AVG RATING', value: `${backendStats.avgRating} ⭐`, icon: <StarIcon sx={{ fontSize: 22, color: '#f43f5e' }} />, bg: 'rgba(244, 63, 94, 0.08)' },
  ];

  if (loading && recentOrders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" width="100%">
        <CircularProgress size={45} sx={{ color: '#06b6d4' }} />
      </Box>
    );
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%', pb: 4 }}>
      
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, color: theme.palette.text.primary, mb: 0.5, letterSpacing: '-1.5px' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 500 }}>
          Real-time enterprise wallet split matrix.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ width: '100%', m: 0, mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} style={{ display: 'flex' }}>
            <Card
              component={motion.div}
              whileHover={{ y: -5, border: '1px solid #06b6d4', boxShadow: '0 10px 30px rgba(6, 182, 212, 0.12)' }}
              sx={{
                bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff',
                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: '24px',
                p: 3,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 3,
                cursor: 'pointer',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: '1px' }}>
                  {stat.title}
                </Typography>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: stat.bg, display: 'flex', alignItems: 'center' }}>{stat.icon}</Box>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', color: theme.palette.text.primary, fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 📊 DYNAMIC REVENUE VECTOR FLOW CHART */}
      <Card sx={{ bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', p: 4, width: '100%', height: '350px', mb: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>Revenue Vector Flow</Typography>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={chartData.length > 0 ? chartData : [ { name: 'No Orders', revenue: 0 } ]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} />
            <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} />
            <Tooltip contentStyle={{ background: mode === 'dark' ? '#070a13' : '#fff', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.3)', fontFamily: '"Plus Jakarta Sans"' }} />
            <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* 📜 DYNAMIC TRANSACTION SPLIT ORDERS TABLE */}
      <Card sx={{ bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', p: 4, width: '100%' }}>
        <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>Recent Split Orders</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`, color: theme.palette.text.secondary, fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' } }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Wallet Coins Deducted</TableCell>
                <TableCell>Cash Paid (Remaining)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: theme.palette.text.secondary, fontFamily: '"Plus Jakarta Sans"' }}>
                    No transactions committed to database ledger yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((row) => (
                  <TableRow key={row._id} sx={{ '& td': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, color: theme.palette.text.primary, fontFamily: '"Plus Jakarta Sans"' } }}>
                    {/* Maps unique object _id shortened to match generic serial codes template */}
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Space Grotesk"' }}>
                      {String(row._id || '').substring(0, 8).toUpperCase()}
                    </TableCell>
                    {/* Safely deep nests objects tracker chain to read userId node maps */}
                    <TableCell>
                      {row.userId?.name ? row.userId.name : 'Guest User'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Space Grotesk"', fontWeight: 600 }}>
                      ₹{(Number(row.totalAmount) || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ color: '#eab308', fontWeight: 600, fontFamily: '"Space Grotesk"' }}>
                      ₹{row.walletPaymentAmount || 0}
                    </TableCell>
                    {/* Calculates cash paid side or defaults fallback type methods */}
                    <TableCell sx={{ fontFamily: '"Space Grotesk"' }}>
                      {row.remainingPaymentMethod === 'COD' ? `₹${Number(row.totalAmount) - (Number(row.walletPaymentAmount) || 0)} (COD)` : `₹${Number(row.totalAmount) - (Number(row.walletPaymentAmount) || 0)}`}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.orderStatus || 'Pending'} 
                        size="small" 
                        sx={{ 
                          bgcolor: (row.orderStatus === 'Paid' || row.orderStatus === 'Delivered') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                          color: (row.orderStatus === 'Paid' || row.orderStatus === 'Delivered') ? '#10b981' : '#eab308', 
                          fontWeight: 700 
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

    </Box>
  );
}