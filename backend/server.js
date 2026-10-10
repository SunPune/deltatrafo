"use strict";

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

// React production build folder
const FRONTEND_DIR = path.join(__dirname, "..", "dist");

// Serve React static files
app.use(express.static(FRONTEND_DIR));

const PORT = process.env.PORT || 5000;

const DATA_FILE = path.join(
  __dirname,
  "data",
  "homeData.json"
);

app.use(cors());
app.use(express.json({ limit: "1mb" }));


// --------------------------------------------------
// Helper: Read JSON
// --------------------------------------------------

function readHomeData() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading homeData.json:", error);

    throw new Error("Unable to read home data");
  }
}


// --------------------------------------------------
// Helper: Write JSON
// --------------------------------------------------

function writeHomeData(data) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error("Error writing homeData.json:", error);

    throw new Error("Unable to save home data");
  }
}


// --------------------------------------------------
// Generate simple admin token
// --------------------------------------------------

function generateToken() {
  return crypto
    .createHash("sha256")
    .update(
      process.env.ADMIN_USERNAME +
      ":" +
      process.env.ADMIN_PASSWORD +
      ":" +
      process.env.ADMIN_TOKEN
    )
    .digest("hex");
}


// --------------------------------------------------
// Admin authentication middleware
// --------------------------------------------------

function authenticateAdmin(req, res, next) {

  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Authorization required"
    });
  }

  const token = authorization.replace("Bearer ", "");

  const validToken = generateToken();

  if (token !== validToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  next();
}


// --------------------------------------------------
// Health check
// --------------------------------------------------

// app.get("/", (req, res) => {

//   res.json({
//     success: true,
//     message: "DeltaTrafo API is running"
//   });

// });

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});


// --------------------------------------------------
// Admin Login
// --------------------------------------------------

app.post("/api/admin/login", (req, res) => {

  const {
    username,
    password
  } = req.body;

  if (!username || !password) {

    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });

  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {

    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });

  }

  const token = generateToken();

  return res.json({
    success: true,
    message: "Login successful",
    token
  });

});


// --------------------------------------------------
// Get Home Data
// Public API
// --------------------------------------------------

app.get("/api/home-data", (req, res) => {

  try {

    const data = readHomeData();

    return res.json({
      success: true,
      data
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// --------------------------------------------------
// Update Complete Home Data
// Admin only
// --------------------------------------------------

app.put(
  "/api/home-data",
  authenticateAdmin,
  (req, res) => {

    try {

      const newData = req.body;

      if (!newData || typeof newData !== "object") {

        return res.status(400).json({
          success: false,
          message: "Invalid JSON data"
        });

      }

      if (!Array.isArray(newData.banners)) {

        return res.status(400).json({
          success: false,
          message: "banners must be an array"
        });

      }

      if (!newData.about || typeof newData.about !== "object") {

        return res.status(400).json({
          success: false,
          message: "about data is required"
        });

      }

      writeHomeData(newData);

      return res.json({
        success: true,
        message: "Home data updated successfully",
        data: newData
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }

  }
);


// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `DeltaTrafo API running on port ${PORT}`
  );

});