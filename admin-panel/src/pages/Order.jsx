import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  useTheme,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Select,
  FormControl,
  Modal,
  Backdrop,
  Fade,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import { endpoints } from "../api/endpoints";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// 🔄 STATUS DROPDOWN COMPONENT
const OrderStatusSelect = ({ initialStatus, orderId }) => {
  const [currentStatus, setCurrentStatus] = useState(
    initialStatus || "Pending",
  );

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const oldStatus = currentStatus;
    setCurrentStatus(newStatus);
    try {
      await endpoints.orders.updateStatus(orderId, newStatus);
    } catch (err) {
      console.error("Server update failed:", err);
      setCurrentStatus(oldStatus);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#10b981";
      case "Processing":
        return "#3b82f6";
      case "Shipped":
        return "#eab308";
      case "Cancelled":
        return "#f43f5e";
      case "Pending":
      default:
        return "#ff9800";
    }
  };

  return (
    <FormControl size="small" sx={{ m: 0, minWidth: 135 }}>
      <Select
        value={currentStatus}
        onChange={handleStatusChange}
        sx={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 700,
          fontSize: "0.85rem",
          color: getStatusColor(currentStatus),
          borderRadius: "10px",
          bgcolor: `${getStatusColor(currentStatus)}15`,
          "& .MuiOutlinedInput-notchedOutline": {
            border: `1px solid ${getStatusColor(currentStatus)}30`,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: getStatusColor(currentStatus),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: getStatusColor(currentStatus),
            borderWidth: 1,
          },
        }}
      >
        {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
          (statusOption) => (
            <MenuItem
              key={statusOption}
              value={statusOption}
              sx={{
                fontFamily: '"Plus Jakarta Sans"',
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {statusOption}
            </MenuItem>
          ),
        )}
      </Select>
    </FormControl>
  );
};

export default function Orders({ mode }) {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [anchorEl, setAnchorEl] = useState(null);

  // MODAL STATES
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await endpoints.orders.getAll();
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = (status) => {
    if (status) setStatusFilter(status);
    setAnchorEl(null);
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };

  // PDF Download Trigger
  const downloadInvoicePDF = (order) => {
  try {
    const doc = new jsPDF();

    // 🏛️ Brand Corporate Layout
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(6, 182, 212); // Premium Cyan
    doc.text("NEXUS OS STORE", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Premium E-commerce System Invoice", 14, 26);
    
    const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    doc.text(`Date: ${invoiceDate}`, 150, 20);
    doc.text(`Order ID: ${order._id || 'N/A'}`, 150, 26);

    doc.setDrawColor(230);
    doc.line(14, 32, 196, 32);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("Billed To:", 14, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer Name: ${order.userId?.name || "Anonymous Client"}`, 14, 48);
    doc.text(`Email Address: ${order.userId?.email || "N/A"}`, 14, 54);
    doc.text(`Payment Mode: ${order.remainingPaymentMethod || "COD"}`, 14, 60);

    const tableColumn = ["Product Title", "Unit Price", "Quantity", "Total"];
    const tableRows = [];

    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const title = typeof item.productId === 'object' && item.productId !== null
          ? (item.productId.title || "Product Item")
          : "Product Item";
          
        const price = Number(item.priceAtPurchase) || 0;
        const qty = Number(item.quantity) || 0;
        
        const rowData = [
          String(title),
          `INR ${price.toLocaleString('en-IN')}`,
          String(qty),
          `INR ${(price * qty).toLocaleString('en-IN')}`
        ];
        tableRows.push(rowData);
      });
    }

    if (tableRows.length === 0) {
      tableRows.push(["No details parsed", "0", "0", "0"]);
    }

    // 🔥 CRITICAL FIX: doc.autoTable(options) HATA KAR DIRECT autoTable FUNCTION CALL KIYA
    autoTable(doc, {
      startY: 68,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255] },
      styles: { fontFamily: "helvetica", fontSize: 10 }
    });

    // Calculations Position Setup safely using doc.lastAutoTable property
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const grandTotal = Number(order.totalAmount) || 0;
    doc.text(`Grand Total Amount: INR ${grandTotal.toLocaleString('en-IN')}`, 130, finalY);

    // Save Action Invoke
    doc.save(`Invoice_${order._id || 'Order'}.pdf`);

  } catch (error) {
    console.error("🚨 CRITICAL PDF ENGINE FAILURE:", error.message);
    alert("Bhai, PDF generation fail ho gayi. Console check kijiye!");
  }
};

  const filteredOrders = orders.filter((order) => {
    const customerName = order.userId?.name || "";
    const orderIdString = order._id || "";
    const currentStatus = order.orderStatus || "Pending";
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderIdString.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ width: "100%", pb: 4 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 5,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 0.5,
              letterSpacing: "-1px",
            }}
          >
            Orders Management
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            Track sales, process fulfillments, and review transaction workflows.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
          sx={{
            borderColor:
              mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            color: theme.palette.text.primary,
            borderRadius: "12px",
            textTransform: "none",
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 600,
            px: 2.5,
            py: 1.2,
            bgcolor: mode === "dark" ? "#0f172a" : "#ffffff",
            "&:hover": { borderColor: "#06b6d4", bgcolor: "transparent" },
          }}
        >
          Filter: {statusFilter}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleFilterClose(null)}
        >
          {[
            "All",
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
          ].map((status) => (
            <MenuItem
              key={status}
              onClick={() => handleFilterClose(status)}
              sx={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 500 }}
            >
              {status}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Search Input */}
      <Box sx={{ mb: 4, width: "100%" }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search orders by Order ID or customer name..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: mode === "dark" ? "#0f172a" : "#ffffff",
              borderRadius: "16px",
              border: "none",
              "& fieldset": {
                border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.06)"}`,
              },
              "&:hover fieldset": { borderColor: "#06b6d4" },
              "&.Mui-focused fieldset": {
                borderColor: "#06b6d4",
                borderWidth: 1,
              },
            },
            input: {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              color: theme.palette.text.primary,
              fontWeight: 500,
            },
          }}
        />
      </Box>

      {/* Table Ledger */}
      <Card
        sx={{
          bgcolor: mode === "dark" ? "#0f172a" : "#ffffff",
          border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.06)"}`,
          borderRadius: "24px",
          p: 3,
          width: "100%",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    borderBottom: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                    color: theme.palette.text.secondary,
                    fontWeight: 800,
                    fontFamily: '"Plus Jakarta Sans"',
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  },
                }}
              >
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status (Action)</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 4, fontFamily: '"Plus Jakarta Sans"' }}
                    >
                      Fetching real-time sales reports...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 4, fontFamily: '"Plus Jakarta Sans"' }}
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      component={motion.tr}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      sx={{
                        "& td": {
                          borderBottom: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}`,
                          color: theme.palette.text.primary,
                          py: 2,
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: '"Space Grotesk"',
                          fontWeight: 700,
                          color: "#06b6d4",
                          fontSize: "0.9rem",
                        }}
                      >
                        {order._id}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Plus Jakarta Sans"',
                          fontWeight: 700,
                        }}
                      >
                        {order.userId?.name || "Anonymous Client"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Plus Jakarta Sans"',
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700 }}
                      >
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Plus Jakarta Sans"',
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {order.remainingPaymentMethod || "COD"}
                      </TableCell>

                      <TableCell>
                        <OrderStatusSelect
                          initialStatus={order.orderStatus}
                          orderId={order._id}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDetails(order)}
                          sx={{
                            color: "#06b6d4",
                            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}`,
                            borderRadius: "10px",
                            p: 1,
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 🏙️ POP-UP MODAL PANEL */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 550 },
              bgcolor: mode === "dark" ? "#0f172a" : "#ffffff",
              border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.1)"}`,
              boxShadow: 24,
              borderRadius: "24px",
              p: 4,
              outline: "none",
              color: theme.palette.text.primary,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 800 }}
              >
                Transaction Receipt Overview
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                sx={{ color: theme.palette.text.secondary }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {selectedOrder && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: '"Plus Jakarta Sans"', mb: 0.5 }}
                >
                  <strong>Order ID:</strong>{" "}
                  <span style={{ color: "#06b6d4", fontWeight: 700 }}>
                    {selectedOrder._id}
                  </span>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: '"Plus Jakarta Sans"', mb: 0.5 }}
                >
                  <strong>Client Name:</strong>{" "}
                  {selectedOrder.userId?.name || "Anonymous Client"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: '"Plus Jakarta Sans"', mb: 2 }}
                >
                  <strong>Method:</strong>{" "}
                  {selectedOrder.remainingPaymentMethod || "COD"}
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans"',
                    fontWeight: 700,
                    mb: 1,
                    color: "#06b6d4",
                  }}
                >
                  Purchased Items:
                </Typography>

                <TableContainer
                  sx={{
                    maxHeight: 180,
                    mb: 3,
                    border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    borderRadius: "12px",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow
                        sx={{
                          "& th": {
                            bgcolor: mode === "dark" ? "#1e293b" : "#f8fafc",
                            fontWeight: 700,
                          },
                        }}
                      >
                        <TableCell>Title</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                          >
                            {item.productId?.title || "Product Item"}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                            {item.quantity}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontFamily: '"Space Grotesk"',
                              fontSize: "0.8rem",
                            }}
                          >
                            ₹{item.priceAtPurchase}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 800 }}
                  >
                    Grand Bill Valuation:
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"Space Grotesk"',
                      fontWeight: 800,
                      color: "#06b6d4",
                    }}
                  >
                    ₹{(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadInvoicePDF(selectedOrder)}
                  sx={{
                    bgcolor: "#06b6d4",
                    color: "#fff",
                    borderRadius: "14px",
                    py: 1.5,
                    fontFamily: '"Plus Jakarta Sans"',
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0891b2" },
                  }}
                >
                  Download Formal Invoice Ledger (PDF)
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
