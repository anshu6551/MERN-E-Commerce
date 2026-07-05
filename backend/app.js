const express = require("express");
const mongoose = require("mongoose");
const DBCon = require("./app/config/db");
const dotenv = require("dotenv");
const mainRoute = require("./app/routes/indexRoute")
const cors = require("cors")


dotenv.config();
DBCon();
const app = express();


const allowedOrigins = [
  "https://mern-e-commerce-seven-rho.vercel.app", 
  "https://e-commerce-djzo.vercel.app",    
  "http://localhost:5173",                       
  "http://localhost:3000"         
               
];



app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, or server-to-server)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());
app.use('/api/v1',mainRoute)

app.get("/", (req, res) => {
    res.send("E-commerce backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});