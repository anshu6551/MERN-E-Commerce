const express = require("express");
const mongoose = require("mongoose");
const DBCon = require("./app/config/db");
const dotenv = require("dotenv");




dotenv.config();

const app = express();
DBCon();



app.get("/", (req, res) => {
    res.send("E-commerce backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});