import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
  useTheme,
  Link,
  Snackbar,
  Alert,
} from "@mui/material"; // 👈 Added Snackbar and Alert
import { motion } from "framer-motion";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { endpoints } from "../api/endpoints";

export default function Login({ mode, setAuth, setAuthView }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 🔔 Notification State Matrix
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'info' | 'warning'
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await endpoints.auth.login(formData);
      const token = response.data.token;
      const name = response.data.user?.name || "Anshu"; // Fallback placeholder logic

      localStorage.setItem("token", token);
      localStorage.setItem("adminName", name); // 👈 This makes it dynamic!

      // 🎉 Success Notification
      setSnackbar({
        open: true,
        message: "Login successful! Welcome To Admin Panel... 🚀",
        severity: "success",
      });

      // Delay workspace layout switch slightly so user can read the success bar
      setTimeout(() => {
        setAuth(true);
      }, 1200);
    } catch (err) {
      console.error("Login verification failed:", err);

      // ⚠️ Error Notification Fallback
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          "Email or Password incorrect! Please check again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: mode === "dark" ? "#02040a" : "#f1f5f9",
        px: { xs: 2, sm: 4 },
        py: 4,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* 🌌 BHYANKAR ANIMATED MESH LIGHTS */}
      <Box
        component={motion.div}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -70, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          top: { xs: "-5%", md: "-10%" },
          left: { xs: "5%", md: "10%" },
          width: { xs: "280px", md: "500px" },
          height: { xs: "280px", md: "500px" },
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0) 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 60, -80, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          bottom: { xs: "-5%", md: "-10%" },
          right: { xs: "5%", md: "10%" },
          width: { xs: "320px", md: "550px" },
          height: { xs: "320px", md: "550px" },
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)",
          borderRadius: "50%",
          filter: "blur(75px)",
          zIndex: 0,
        }}
      />

      {/* 🕸️ 🔥 LIVE MOVING TECH GRID OVERLAY */}
      <Box
        component={motion.div}
        animate={{
          backgroundPositionX: ["0px", "48px"],
          backgroundPositionY: ["0px", "48px"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            mode === "dark"
              ? "linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)"
              : "linear-gradient(to right, rgba(6, 182, 212, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          zIndex: 0,
        }}
      />

      {/* 🖥️ STRICT RESPONSIVE MATRIC VIEW CONTAINER */}
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "420px" },
          p: { xs: 3, sm: 4 },
          borderRadius: "28px",
          bgcolor:
            mode === "dark"
              ? "rgba(10, 15, 30, 0.72)"
              : "rgba(255, 255, 255, 0.88)",
          border: `1px solid ${mode === "dark" ? "rgba(6, 182, 212, 0.18)" : "rgba(6, 182, 212, 0.22)"}`,
          backdropFilter: "blur(24px)",
          boxShadow:
            mode === "dark"
              ? "0 30px 70px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 20px 45px rgba(0,0,0,0.06)",
          zIndex: 1,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              color: "#06b6d4",
              mb: 1,
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.8rem", sm: "2.125rem" },
            }}
          >
            NEXUS OS
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans"',
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            Enter portal credentials to initialize control panel.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box>
            <TextField
              label="Email Address"
              required
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#06b6d4", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Account Password"
              required
              fullWidth
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#06b6d4", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                width: "100%",
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                textTransform: "none",
                borderRadius: "14px",
                fontFamily: '"Plus Jakarta Sans"',
                fontWeight: 700,
                py: 1.6,
                fontSize: "0.95rem",
                boxShadow: "0 8px 25px rgba(6, 182, 212, 0.3)",
                mb: 1,
                "&:hover": { filter: "brightness(1.1)" },
              }}
            >
              {loading ? "Verifying Link..." : "Authenticate Portal"}
            </Button>
          </Box>
        </form>

        <Box textAlign="center" sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Plus Jakarta Sans"',
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            New terminal admin?{" "}
            <Link
              component="button"
              onClick={() => setAuthView("register")}
              sx={{
                color: "#06b6d4",
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: '"Plus Jakarta Sans"',
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>
      </Card>

      {/* ⚡ THE DYNAMIC NOTIFICATION BAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Positioned cleanly at top-center
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontFamily: '"Plus Jakarta Sans"',
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
