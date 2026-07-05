import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, useTheme, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton, Modal, Backdrop, Fade, CircularProgress,
  Snackbar, Alert // 1. Added clean notification controllers
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Icon for image choice selection
import { endpoints } from '../api/endpoints';

export default function Products({ mode }) {
  const theme = useTheme();
  
  // 🔌 Core State Matrices
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔔 Notification Alert Bar Configuration State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 📝 Modal Form Controller Interfaces
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  
  // 🔄 Dynamic form mappings adapted for raw multi-part binary media uploads
  const [formData, setFormData] = useState({
    name: '',       
    category: '',   
    price: '',      
    stock: '',      
    description: '',
    imageFile: null // 2. Changed tracking node from URL string to explicit File object
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * 📡 Pull product assets from the repository layer
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await endpoints.products.getAll();
      setProducts(response.data?.data || []);
    } catch (err) {
      console.error("Data tracking pipeline execution failed:", err);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', category: '', price: '', stock: '', description: '', imageFile: null });
    setOpenModal(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);
    setFormData({
      name: product.title,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      imageFile: null // Reset file hook on edit initialization loop
    });
    setOpenModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  /**
   * 💾 MULTIPART ENCODING FORM DISPATCH MATRIX
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // ⚠️ CRITICAL: Use standard FormData instead of JSON payload object matrices when sending files
    const dataWrapper = new FormData();
    dataWrapper.append('title', formData.name);
    dataWrapper.append('category', formData.category);
    dataWrapper.append('price', Number(formData.price));
    dataWrapper.append('stock', Number(formData.stock));
    dataWrapper.append('description', formData.description);
    
    // Append binary image stream if chosen by workspace admin
    if (formData.imageFile) {
      dataWrapper.append('images', formData.imageFile); 
    }

    try {
      setLoading(true);
      if (isEditing) {
        await endpoints.products.update(currentProductId, dataWrapper);
        setSnackbar({ open: true, message: "Product updated successfully!", severity: 'success' });
        await fetchProducts(); // Refresh dataset array loop to align newly updated cloud images maps
      } else {
        await endpoints.products.create(dataWrapper);
        setSnackbar({ open: true, message: "Product initialized and added to core database ledger!", severity: 'success' });
        await fetchProducts(); 
      }
      setOpenModal(false);
    } catch (err) {
      console.error("Server synchronization failed:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to commit product asset updates.", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to permanently remove this product component asset?")) {
      try {
        setLoading(true);
        await endpoints.products.delete(id);
        setProducts(products.filter(item => item._id !== id));
        setSnackbar({ open: true, message: "Asset successfully wiped from data ledger.", severity: 'success' });
      } catch (err) {
        console.error("Removal transaction operation execution halted:", err);
        setSnackbar({ open: true, message: "Server denied deletion protocol intercept.", severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProducts = (products || []).filter(product => {
    if (!product || !product.title || !product.category) return false;
    return (
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusChip = (stock) => {
    if (stock === 0) return <Chip label="Out of Stock" size="small" sx={{ bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', fontWeight: 700 }} />;
    if (stock <= 5) return <Chip label="Low Stock" size="small" sx={{ bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', fontWeight: 700 }} />;
    return <Chip label="In Stock" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700 }} />;
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%', pb: 4 }}>
      
      {/* Header Viewport Interface */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 5 }}>
        <Box>
          <Typography variant="h3" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, color: theme.palette.text.primary, mb: 0.5, letterSpacing: '-1px' }}>
            Products Inventory
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 500 }}>
            Manage core stock, categories, and marketplace pricing metrics.
          </Typography>
        </Box>

        <Button
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            textTransform: 'none',
            borderRadius: '14px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            px: 3, py: 1.5,
            boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)',
            '&:hover': { background: 'linear-gradient(135deg, #06b6d4 30%, #3b82f6 100%)' }
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Query Search Panel */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name or catalog category..."
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
              '& fieldset': { border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}` },
              '&:hover fieldset': { borderColor: '#06b6d4' },
              '&.Mui-focused fieldset': { borderColor: '#06b6d4', borderWidth: '1px' },
            },
            input: { fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.primary, fontWeight: 500 }
          }}
        />
      </Box>

      {/* Primary Data Table Ledger Card */}
      <Card 
        sx={{ 
          bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff', 
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.06)'}`, 
          borderRadius: '24px', 
          p: 3, 
          width: '100%', 
          boxShadow: mode === 'dark' ? 'none' : '0 10px 30px rgba(0,0,0,0.02)' 
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`, color: theme.palette.text.secondary, fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' } }}>
                <TableCell>Product Details</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock Count</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={36} sx={{ color: '#06b6d4' }} />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, fontFamily: '"Plus Jakarta Sans"', color: theme.palette.text.secondary, fontWeight: 500 }}>
                    No matching structural product elements found in current database segment.
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <TableRow 
                      key={product._id} 
                      component={motion.tr}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      sx={{ '& td': { borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, color: theme.palette.text.primary, py: 2.5 } }}
                    >
                      <TableCell sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>
                        {product.title}
                      </TableCell>
                      
                      <TableCell sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 500, color: theme.palette.text.secondary }}>
                        {product.category}
                      </TableCell>
                      
                      <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </TableCell>
                      
                      <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                        {product.stock} Units
                      </TableCell>
                      
                      <TableCell>{getStatusChip(product.stock)}</TableCell>
                      
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <IconButton 
                            onClick={() => handleOpenEditModal(product)}
                            sx={{ color: '#06b6d4', border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '10px', p: 1 }}
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteProduct(product._id)} 
                            sx={{ color: '#f43f5e', border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '10px', p: 1 }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add / Edit Inventory Modal Window (Expanded with Dynamic Inputs) */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={openModal}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 550 }, 
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff',
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '24px', p: 4, outline: 'none',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <Typography variant="h5" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, mb: 3, color: theme.palette.text.primary }}>
              {isEditing ? '⚡ Edit Product Details' : '✨ Add New Product'}
            </Typography>

            <form onSubmit={handleFormSubmit}>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField 
                  label="Product Name" required fullWidth
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  InputLabelProps={{ style: { fontFamily: '"Plus Jakarta Sans"' } }}
                  sx={{mb:2}}
                />
                <TextField 
                  label="Category" required fullWidth
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  InputLabelProps={{ style: { fontFamily: '"Plus Jakarta Sans"' } }}
                  sx={{mb:1}}
                />
                <TextField 
                  label="Price (INR)" type="number" required fullWidth
                  value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                  InputLabelProps={{ style: { fontFamily: '"Plus Jakarta Sans"' } }}
                  sx={{mb:1}}
                />
                <TextField 
                  label="Stock Units" type="number" required fullWidth
                  value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  InputLabelProps={{ style: { fontFamily: '"Plus Jakarta Sans"' } }}
                  sx={{mb:1}}
                />
                
                <TextField 
                  label="Product Description" required fullWidth multiline rows={3}
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  InputLabelProps={{ style: { fontFamily: '"Plus Jakarta Sans"' } }}
                  sx={{mb:1}}
                />

                {/* 🖼️ HIGH-TECH FILE PICKER INTERFACE (Keeps your clean design) */}
                <Box sx={{ mt: 1, mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="contained-button-file"
                    type="file"
                    onChange={handleFileChange}
                    required={!isEditing} // Mandatory only during fresh creations
                  />
                  <label htmlFor="contained-button-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        width: '100%',
                        py: 1.8,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontFamily: '"Plus Jakarta Sans"',
                        fontWeight: 600,
                        borderStyle: 'dashed',
                        borderWidth: '2px',
                        borderColor: formData.imageFile ? '#10b981' : '#06b6d4',
                        color: formData.imageFile ? '#10b981' : '#06b6d4',
                        '&:hover': {
                          borderStyle: 'dashed',
                          borderWidth: '2px',
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(6, 182, 212, 0.04)'
                        }
                      }}
                    >
                      {formData.imageFile 
                        ? `Selected: ${formData.imageFile.name.substring(0, 25)}... ✅` 
                        : isEditing ? "Change Product Image Asset (Optional)" : "Choose Product Image File 📁"}
                    </Button>
                  </label>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button 
                    onClick={() => setOpenModal(false)}
                    sx={{ color: "white", textTransform: 'none', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, bgcolor: "#f43f5e", borderRadius: "10px", px: 2, py: 1, '&:hover': { bgcolor: '#e11d48' }, mr:1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" variant="contained" disabled={loading}
                    sx={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontFamily: '"Plus Jakarta Sans"', px: 2 }}
                  >
                    {isEditing ? 'Save Changes' : 'Add Product'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>

      {/* 🔮 GLOBAL NOTIFICATION CENTER BAR */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontFamily: '"Plus Jakarta Sans"', borderRadius: '10px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}