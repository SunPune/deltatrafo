"use strict";

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
require("dotenv").config();

const app = express();

const FRONTEND_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// Storage
// Set STORAGE_PATH to a persistent directory outside
// /app, confirmed by GoDaddy to survive redeployments.
// --------------------------------------------------

const STORAGE_DIR =
  process.env.STORAGE_PATH ||
  path.join(__dirname, "..", "public", "assets", "delta-storages");

const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOAD_DIR = path.join(STORAGE_DIR, "uploads");
const SEED_DIR = path.join(__dirname, "seed");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Initialize missing JSON files without overwriting
// existing admin-managed data.
function initializeJsonFile(file, fallbackValue) {
  const target = path.join(DATA_DIR, file);

  if (fs.existsSync(target)) {
    return;
  }

  const seedCandidates = [
    path.join(SEED_DIR, file),
    path.join(__dirname, "..", "public", "assets", "data", file),
  ];

  const seed = seedCandidates.find(
    (candidate) =>
      fs.existsSync(candidate) &&
      fs.statSync(candidate).isFile()
  );

  if (seed) {
    fs.copyFileSync(seed, target);
    console.log(`Seeded ${file} from ${seed}`);
    return;
  }

  if (fallbackValue !== undefined) {
    fs.writeFileSync(
      target,
      JSON.stringify(fallbackValue, null, 2),
      "utf8"
    );

    console.warn(
      `Created ${file} with fallback data because no seed file was found. ` +
      "Restore your real seed data if the website needs additional fields."
    );
    return;
  }

  console.error(
    `Missing ${file}: add it to backend/seed/ or public/assets/data/.`
  );
}

initializeJsonFile("homeData.json", {
  banners: [],
  about: {},
});

initializeJsonFile("products.json", {});

const DATA_FILE = path.join(DATA_DIR, "homeData.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// --------------------------------------------------
// Admin authentication
// --------------------------------------------------

function generateToken() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_TOKEN;

  if (!username || !password || !secret) {
    throw new Error(
      "Missing ADMIN_USERNAME, ADMIN_PASSWORD, or ADMIN_TOKEN environment variable."
    );
  }

  return crypto
    .createHash("sha256")
    .update(`${username}:${password}:${secret}`)
    .digest("hex");
}

function authenticateAdmin(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required",
    });
  }

  let validToken;

  try {
    validToken = generateToken();
  } catch (error) {
    console.error(
      "Admin authentication configuration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Admin authentication is not configured",
    });
  }

  const token = authorization.slice("Bearer ".length);
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
// Image uploads
// --------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },

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

// Publicly serve uploaded images.
app.use("/uploads", express.static(UPLOAD_DIR));

// Compatibility with older saved image paths.
app.use("/assets/uploads", express.static(UPLOAD_DIR));

app.post(
  "/api/upload",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    return res.json({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  }
);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "DeltaTrafo server is healthy",
  });
});

// Serve the React production build.
app.use(express.static(FRONTEND_DIR));

// --------------------------------------------------
// Home data helpers
// --------------------------------------------------

function readHomeData() {
  try {
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading home data at ${DATA_FILE}:`, error);

    throw new Error(
      "Unable to read home data. Check the storage file and permissions."
    );
  }
}

function writeHomeData(data) {
  const tempFile = `${DATA_FILE}.${process.pid}.tmp`;

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    fs.writeFileSync(
      tempFile,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (error) {
    console.error(`Error writing home data at ${DATA_FILE}:`, error);

    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (_) {
      // Ignore cleanup errors.
    }

    throw new Error(
      "Unable to save home data. Check storage permissions."
    );
  }
}

// --------------------------------------------------
// Products helpers
// --------------------------------------------------

async function readProducts() {
  try {
    const content = await fsPromises.readFile(
      PRODUCTS_FILE,
      "utf8"
    );

    const products = JSON.parse(content);

    if (
      !products ||
      typeof products !== "object" ||
      Array.isArray(products)
    ) {
      throw new Error(
        "products.json must contain a JSON object keyed by slug"
      );
    }

    return products;
  } catch (error) {
    console.error(`Error reading products at ${PRODUCTS_FILE}:`, error);
    throw error;
  }
}

async function saveProducts(products) {
  const tempFile = `${PRODUCTS_FILE}.${process.pid}.tmp`;

  try {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });

    await fsPromises.writeFile(
      tempFile,
      JSON.stringify(products, null, 2),
      "utf8"
    );

    await fsPromises.rename(tempFile, PRODUCTS_FILE);
  } catch (error) {
    console.error(`Error saving products at ${PRODUCTS_FILE}:`, error);

    try {
      await fsPromises.unlink(tempFile);
    } catch (_) {
      // Ignore cleanup errors.
    }

    throw error;
  }
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

// GET all products.
app.get("/api/products", async (req, res) => {
  try {
    return res.json(await readProducts());
  } catch (error) {
    console.error("Error fetching products:", error);

    return res.status(500).json({
      message: "Unable to load products",
    });
  }
});

// GET one product by slug.
app.get("/api/products/:slug", async (req, res) => {
  try {
    const products = await readProducts();
    const product = products[req.params.slug];

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);

    return res.status(500).json({
      message: "Unable to load product",
    });
  }
});

// POST a new product.
app.post("/api/products", authenticateAdmin, async (req, res) => {
  try {
    const product = req.body;

    if (!validProduct(product)) {
      return res.status(400).json({
        message: "Invalid product data",
      });
    }

    const products = await readProducts();
    const slug = createSlug(product.slug || product.name);

    if (!slug) {
      return res.status(400).json({
        message: "Invalid product slug",
      });
    }

    if (products[slug]) {
      return res.status(409).json({
        message: "Product already exists",
      });
    }

    products[slug] = { ...product };
    delete products[slug].slug;

    await saveProducts(products);

    return res.status(201).json({
      slug,
      product: products[slug],
    });
  } catch (error) {
    console.error("Error adding product:", error);

    return res.status(500).json({
      message: "Unable to add product",
    });
  }
});

// PUT update an existing product.
app.put(
  "/api/products/:slug",
  authenticateAdmin,
  async (req, res) => {
    try {
      const products = await readProducts();
      const slug = req.params.slug;

      if (!products[slug]) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (!validProduct(req.body)) {
        return res.status(400).json({
          message: "Invalid product data",
        });
      }

      products[slug] = { ...req.body };
      delete products[slug].slug;

      await saveProducts(products);

      return res.json({
        slug,
        product: products[slug],
      });
    } catch (error) {
      console.error("Error updating product:", error);

      return res.status(500).json({
        message: "Unable to update product",
      });
    }
  }
);

// DELETE a product.
app.delete(
  "/api/products/:slug",
  authenticateAdmin,
  async (req, res) => {
    try {
      const products = await readProducts();
      const slug = req.params.slug;

      if (!products[slug]) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      delete products[slug];
      await saveProducts(products);

      return res.json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);

      return res.status(500).json({
        message: "Unable to delete product",
      });
    }
  }
);

// --------------------------------------------------
// Admin login
// --------------------------------------------------

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

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

  try {
    return res.json({
      success: true,
      message: "Login successful",
      token: generateToken(),
    });
  } catch (error) {
    console.error(
      "Admin authentication configuration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Admin authentication is not configured",
    });
  }
});

// --------------------------------------------------
// Home data API
// --------------------------------------------------

app.get("/api/home-data", (req, res) => {
  try {
    return res.json({
      success: true,
      data: readHomeData(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.put("/api/home-data", authenticateAdmin, (req, res) => {
  try {
    const newData = req.body;

    if (
      !newData ||
      typeof newData !== "object" ||
      Array.isArray(newData)
    ) {
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

    if (
      !newData.about ||
      typeof newData.about !== "object" ||
      Array.isArray(newData.about)
    ) {
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Unknown API routes should return JSON 404.
app.use("/api", (req, res) => {
  return res.status(404).json({
    message: "API route not found",
  });
});

// React SPA fallback (Express 5).
app.get("/{*splat}", (req, res) => {
  return res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// --------------------------------------------------
// Error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("Request error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(400).json({
    success: false,
    message: err.message || "Request failed",
  });
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DeltaTrafo API running on port ${PORT}`);
  console.log(`Storage directory: ${STORAGE_DIR}`);

  if (!process.env.STORAGE_PATH) {
    console.warn(
      "STORAGE_PATH is not set. The fallback storage path is inside " +
      "the project and may not survive redeployment. Configure a " +
      "persistent path in hosting."
    );
  }
});