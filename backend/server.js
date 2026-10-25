"use strict";

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
require("dotenv").config();

const app = express();

// React production build folder
const FRONTEND_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// Persistent storage OUTSIDE the project
// (survives git pull / npm run build / redeploy)
// Set STORAGE_PATH in cPanel, e.g. /home/YOURUSER/app-storage
// --------------------------------------------------

const STORAGE_DIR =
  process.env.STORAGE_PATH ||
  path.join(__dirname, "..", "public", "assets", "delta-storage");

const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOAD_DIR = path.join(STORAGE_DIR, "uploads");
const SEED_DIR = path.join(__dirname, "seed");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Copy default data only if the live file does not exist yet
["homeData.json", "products.json"].forEach((file) => {
  const target = path.join(DATA_DIR, file);
  const seed = path.join(SEED_DIR, file);
  if (!fs.existsSync(target) && fs.existsSync(seed)) {
    fs.copyFileSync(seed, target);
    console.log(`Seeded ${file}`);
  }
});

const DATA_FILE = path.join(DATA_DIR, "homeData.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// --------------------------------------------------
// Admin token + authentication
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

function authenticateAdmin(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Authorization required",
    });
  }

  const token = authorization.replace("Bearer ", "");
  const validToken = generateToken();

  const a = Buffer.from(token);
  const b = Buffer.from(validToken);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  next();
}

// --------------------------------------------------
// Image upload
// --------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only JPG, PNG, and WebP images are allowed"));
  },
});

// Serve uploaded images publicly
app.use("/uploads", express.static(UPLOAD_DIR));
// Backward compatibility for old image paths stored in JSON
app.use("/assets/uploads", express.static(UPLOAD_DIR));

// Upload API (admin only)
app.post(
  "/api/upload",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image" });
    }

    res.json({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  }
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "DeltaTrafo server is healthy",
  });
});

// Serve React static files
app.use(express.static(FRONTEND_DIR));

// --------------------------------------------------
// Home data helpers
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

function writeHomeData(data) {
  try {
    const tmp = DATA_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
    return true;
  } catch (error) {
    console.error("Error writing homeData.json:", error);
    throw new Error("Unable to save home data");
  }
}

// --------------------------------------------------
// Products helpers
// --------------------------------------------------

async function readProducts() {
  try {
    const content = await fsPromises.readFile(PRODUCTS_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") return {}; // no file yet
    throw error;
  }
}

async function saveProducts(products) {
  const tempFile = PRODUCTS_FILE + ".tmp";

  await fsPromises.mkdir(DATA_DIR, { recursive: true });
  await fsPromises.writeFile(
    tempFile,
    JSON.stringify(products, null, 2),
    "utf8"
  );
  await fsPromises.rename(tempFile, PRODUCTS_FILE);
}

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validProduct(product) {
  return (
    product &&
    typeof product.name === "string" &&
    product.name.trim() !== "" &&
    typeof product.description === "string" &&
    Array.isArray(product.images) &&
    product.images.every((image) => typeof image === "string") &&
    Array.isArray(product.specifications) &&
    product.specifications.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 2 &&
        row.every((value) => typeof value === "string")
    )
  );
}

// --------------------------------------------------
// Products API
// --------------------------------------------------

// GET: all products (public)
app.get("/api/products", async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Unable to load products" });
  }
});

// GET: one product (public)
app.get("/api/products/:slug", async (req, res) => {
  try {
    const products = await readProducts();
    const product = products[req.params.slug];

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load product" });
  }
});

// POST: add product (admin only)
app.post("/api/products", authenticateAdmin, async (req, res) => {
  try {
    const product = req.body;

    if (!validProduct(product)) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const products = await readProducts();
    const slug = createSlug(product.slug || product.name);

    if (!slug) {
      return res.status(400).json({ message: "Invalid product slug" });
    }

    if (products[slug]) {
      return res.status(409).json({ message: "Product already exists" });
    }

    products[slug] = product;
    delete products[slug].slug;

    await saveProducts(products);

    res.status(201).json({ slug, product: products[slug] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to add product" });
  }
});

// PUT: update product (admin only)
app.put("/api/products/:slug", authenticateAdmin, async (req, res) => {
  try {
    const products = await readProducts();
    const slug = req.params.slug;

    if (!products[slug]) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!validProduct(req.body)) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    products[slug] = req.body;
    delete products[slug].slug;

    await saveProducts(products);

    res.json({ slug, product: products[slug] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to update product" });
  }
});

// DELETE: delete product (admin only)
app.delete("/api/products/:slug", authenticateAdmin, async (req, res) => {
  try {
    const products = await readProducts();
    const slug = req.params.slug;

    if (!products[slug]) {
      return res.status(404).json({ message: "Product not found" });
    }

    delete products[slug];
    await saveProducts(products);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to delete product" });
  }
});

// --------------------------------------------------
// Admin login
// --------------------------------------------------

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  return res.json({
    success: true,
    message: "Login successful",
    token: generateToken(),
  });
});

// --------------------------------------------------
// Home data
// --------------------------------------------------

// Public
app.get("/api/home-data", (req, res) => {
  try {
    const data = readHomeData();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin only
app.put("/api/home-data", authenticateAdmin, (req, res) => {
  try {
    const newData = req.body;

    if (!newData || typeof newData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data",
      });
    }

    if (!Array.isArray(newData.banners)) {
      return res.status(400).json({
        success: false,
        message: "banners must be an array",
      });
    }

    if (!newData.about || typeof newData.about !== "object") {
      return res.status(400).json({
        success: false,
        message: "about data is required",
      });
    }

    writeHomeData(newData);

    return res.json({
      success: true,
      message: "Home data updated successfully",
      data: newData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Unknown API routes return JSON 404 (not the React page)
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Send React's index.html for all frontend routes (Express 5 syntax)
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// --------------------------------------------------
// Error handler (upload errors, bad JSON, etc.)
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ success: false, message: err.message });
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DeltaTrafo API running on port ${PORT}`);
  console.log(`Storage directory: ${STORAGE_DIR}`);
});