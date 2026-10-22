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

// Parse request bodies
app.use(cors());
app.use(express.json({ limit: "1mb" }));

//upload
const DATA_DIR = path.join(
  process.cwd(),
  "public",
  "assets",
  "data"
);

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "assets",
  "uploads"
);

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Store uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename =
      crypto.randomUUID() + ext;

    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG, and WebP images are allowed"));
  },
});

// Serve uploaded images publicly
app.use("/uploads", express.static(UPLOAD_DIR));

// Upload API
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select an image" });
  }

  res.json({
    message: "Image uploaded successfully",
    imageUrl: `/uploads/${req.file.filename}`,
  });
});


// Health check: public and accessible to the hosting platform
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "DeltaTrafo server is healthy",
  });
});

// Serve React static files
app.use(express.static(FRONTEND_DIR));

//admin home page data file
const DATA_FILE = path.join(
  DATA_DIR,
  "homeData.json"
);

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


//products
const PRODUCTS_FILE = path.join(
  DATA_DIR,
  "products.json"
);

const HOME_FILE = path.join(
  DATA_DIR,
  "homeData.json"
);

async function readProducts() {
  
  const content = await fsPromises.readFile(PRODUCTS_FILE, "utf8");
  return JSON.parse(content);
}

async function saveProducts(products) {
  const tempFile = PRODUCTS_FILE + ".tmp";

  // Check whether products.json exists
  //await fsPromises.access(PRODUCTS_FILE);
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
    product.images.every(image => typeof image === "string") &&
    Array.isArray(product.specifications) &&
    product.specifications.every(
      row =>
        Array.isArray(row) &&
        row.length === 2 &&
        row.every(value => typeof value === "string")
    )
  );
}

// GET: Fetch all products
app.get("/api/products", async (req, res) => {
  console.log("Fetching all products");

  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      message: "Unable to load products"
    });
  }
});

// GET: Fetch one product
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

// POST: Add a product
app.post("/api/products", async (req, res) => {
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

// PUT: Update a product without changing its URL slug
app.put("/api/products/:slug", async (req, res) => {
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

// DELETE: Delete a product
app.delete("/api/products/:slug", async (req, res) => {
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

// Keep your existing API routes above this section.

// Send React's index.html for frontend routes
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});


// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `DeltaTrafo API running on port ${PORT}`
  );

});