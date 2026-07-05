import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  Menu,         // 👈 Added Menu for dropdown
  MenuItem,     // 👈 Added MenuItem
  ListItemIcon, // 👈 Added for nice icons inside the menu
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RateReviewIcon from "@mui/icons-material/RateReview";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LogoutIcon from "@mui/icons-material/Logout"; // 👈 Added Logout Icon

const itemVariants = {
  hover: {
    scale: 1.02,
    x: 4,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  tap: { scale: 0.98 },
};

export default function DashboardLayout({
  children,
  activePage,
  setActivePage,
  mode,
  toggleTheme,
  setAuth, // 👈 Destructure setAuth here to log out and close workspace layout
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // 👈 Profile menu anchor point
  const [adminName, setAdminName] = useState("Admin"); // 👈 Dynamic string allocation container
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const openMenu = Boolean(anchorEl);

  // 📡 DYNAMIC NAMESPACE DECRYPTION MATRIX
  useEffect(() => {
    // If you store username/admin details upon login, grab it here.
    // e.g., localStorage.setItem('adminName', response.data.user.name)
    const storedName = localStorage.getItem("adminName");
    if (storedName) {
      setAdminName(storedName);
    }
  }, []);

  // Get the first initial dynamically
  const nameInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  // 🧹 SYSTEM WORKSPACE REBOOT (LOGOUT INTERCEPTOR)
  const handleLogout = () => {
    handleProfileClose();
    localStorage.removeItem("token"); // Removes authentication token matrix
    localStorage.removeItem("adminName"); // Cleanup name cache data block
    
    if (setAuth) {
      setAuth(false); // Unlocks workspace layout layer back to login wall
    } else {
      window.location.reload(); // Fallback hard redirect
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 20 }} />, id: "dashboard" },
    { text: "Products", icon: <ShoppingBagIcon sx={{ fontSize: 20 }} />, id: "products" },
    { text: "Orders", icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />, id: "orders" },
    { text: "Reviews", icon: <RateReviewIcon sx={{ fontSize: 20 }} />, id: "reviews" },
    { text: "Users List", icon: <PeopleAltIcon sx={{ fontSize: 20 }} />, id: "users" }, 
    { text: "Wallet Settings", icon: <SettingsSuggestIcon sx={{ fontSize: 20 }} />, id: "wallet_settings" },
  ];

  const SidebarElement = ({ isMobileDrawer }) => (
    <Box
      sx={{
        background: theme.palette.background.paper,
        backdropFilter: "blur(16px)",
        border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0,0,0,0.06)"}`,
        borderRadius: isMobileDrawer ? "0px" : "24px",
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: mode === "dark" ? "0 20px 40px rgba(0,0,0,0.4)" : "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 800,
            letterSpacing: "0.5px",
            color: theme.palette.text.primary,
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          NEXUS OS
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <Box
              key={item.id}
              component={motion.div}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => {
                setActivePage(item.id);
                if (isMobileDrawer) setMobileOpen(false);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1.5,
                px: 2,
                borderRadius: "14px",
                cursor: "pointer",
                position: "relative",
                color: isActive ? "#06b6d4" : theme.palette.text.secondary,
                overflow: "hidden",
                isolation: "isolate",
              }}
            >
              <AnimatePresence>
                {isActive && (
                  <Box
                    component={motion.div}
                    layoutId={isMobileDrawer ? "mobileActiveGlow" : "desktopActiveGlow"}
                    style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: mode === "dark"
                        ? "linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.04) 100%)"
                        : "linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.03) 100%)",
                      borderLeft: "4px solid #06b6d4",
                      borderRadius: "14px",
                      zIndex: 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </AnimatePresence>

              <Box sx={{ zIndex: 2, display: "flex", alignItems: "center", position: "relative" }}>
                {item.icon}
              </Box>
              <Typography sx={{ zIndex: 2, position: "relative", fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: "0.95rem", fontWeight: isActive ? 700 : 500 }}>
                {item.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", bgcolor: theme.palette.background.default, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: theme.palette.background.paper, p: 2 }}>
          <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#06b6d4" }}><MenuIcon /></IconButton>
          <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 800, color: theme.palette.text.primary, fontSize: "1.1rem" }}>NEXUS OS</Typography>
          {/* Mobile Profile Trigger */}
          <Avatar 
            onClick={handleProfileClick}
            sx={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", width: 32, height: 32, cursor: "pointer", fontSize: "0.9rem", fontWeight: 800 }}
          >
            {nameInitial}
          </Avatar>
        </Box>
      )}

      <Box sx={{ display: "flex", flexGrow: 1, width: "100%", p: { xs: 2, md: 4 }, gap: 4, boxSizing: "border-box" }}>
        {!isMobile && (
          <Box sx={{ width: "280px", minWidth: "280px", position: "sticky", top: "32px", height: "calc(100vh - 64px)" }}>
            <SidebarElement isMobileDrawer={false} />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }}>
          {!isMobile && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5, width: "100%", height: "48px" }}>
              <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "0.75rem", display: 'flex', alignItems: 'center', height: '100%' }}>
                SYSTEM PORTAL / <span style={{ color: "#06b6d4", marginLeft: "6px" }}>{activePage.replace("_", " ")}</span>
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 1.5, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                  <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.secondary, border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {mode === "dark" ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                  <IconButton sx={{ color: theme.palette.text.secondary, border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <NotificationsNoneIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {/* 👤 INTERACTIVE SYSTEM PROFILE CAPITOL */}
                <Box 
                  onClick={handleProfileClick}
                  sx={{ 
                    display: "flex", alignItems: "center", gap: 1.2, bgcolor: theme.palette.background.paper, p: "0 16px 0 6px", borderRadius: "30px", 
                    border: `1px solid ${openMenu ? "#06b6d4" : mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"}`, 
                    height: 42, boxSizing: "border-box", cursor: "pointer", transition: "all 0.2s ease"
                  }}
                >
                  <Avatar sx={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", color: theme.palette.text.primary, width: 30, height: 30, fontSize: "1rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ transform: "translateY(-0.5px)" }}>{nameInitial}</span>
                  </Avatar>
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: theme.palette.text.primary, fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", m: 0, p: 0, lineHeight: 1 }}>
                    {adminName}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ width: "100%", flexGrow: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activePage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>

      {/* 🔮 DROP DOWN SYSTEM UTILITY CONSOLE */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleProfileClose}
        onClick={handleProfileClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: theme.palette.background.paper,
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            boxShadow: mode === "dark" ? "0 10px 30px rgba(0,0,0,0.5)" : "0 10px 25px rgba(0,0,0,0.08)",
            minWidth: 160,
            overflow: "visible",
            "&::before": {
              content: '""', display: "block", position: "absolute", top: 0, right: 18, width: 10, height: 10,
              bgcolor: theme.palette.background.paper, transform: "translateY(-50%) rotate(45deg)", zIndex: 0,
              borderTop: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
              borderLeft: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            }
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            py: 1.2, px: 2, borderRadius: "10px", mx: 0.5,
            fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: "0.9rem", fontWeight: 600, color: "#f43f5e",
            "&:hover": { bgcolor: mode === "dark" ? "rgba(244, 63, 94, 0.1)" : "rgba(244, 63, 94, 0.05)" } 
          }}
        >
          <ListItemIcon><LogoutIcon sx={{ color: "#f43f5e", fontSize: 20 }} /></ListItemIcon>
          Term Out / Logout
        </MenuItem>
      </Menu>

      <SwipeableDrawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} onOpen={() => setMobileOpen(true)} PaperProps={{ sx: { bgcolor: theme.palette.background.default, width: 260 } }}>
        <SidebarElement isMobileDrawer={true} />
      </SwipeableDrawer>
    </Box>
  );
}