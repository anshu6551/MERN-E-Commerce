const express = require("express");
const mongoose = require("mongoose");
const DBCon = require("./app/config/db");
const dotenv = require("dotenv");
const mainRoute = require("./app/routes/indexRoute")


dotenv.config();
DBCon();
const app = express();


app.use(express.json());
app.use('/api/v1',mainRoute)

app.get("/", (req, res) => {
    res.send("E-commerce backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});