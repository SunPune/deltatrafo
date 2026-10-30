
"use strict";

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const mysql = require("mysql2/promise");

require("dotenv").config();

const app = express();

const FRONTEND_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ==================================================
// PERSISTENT STORAGE
// ==================================================

const STORAGE_DIR =
  process.env.STORAGE_PATH ||
  path.join(__dirname, "..", "public", "assets", "delta-storage");

const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOAD_DIR = path.join(STORAGE_DIR, "uploads");
const SEED_DIR = path.join(__dirname, "seed");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const DATA_FILE = path.join(DATA_DIR, "homePageData.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "productsData.json");

// Copy seed JSON only when the persistent file is missing.
["homePageData.json", "productsData.json"].forEach((file) => {
  const target = path.join(DATA_DIR, file);
  const seed = path.join(SEED_DIR, file);

  if (!fs.existsSync(target) && fs.existsSync(seed)) {
    fs.copyFileSync(seed, target);
    console.log(`Seeded ${file}`);
  }
});

// ==================================================
// MYSQL CONNECTION
// ==================================================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

// ==================================================
// MYSQL TABLE CHECK AND CREATION
// ==================================================

async function ensureDatabaseTables() {
  const connection = await db.getConnection();

  try {
    // Check products table.
    const [productTables] = await connection.execute(`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'products'
    `);

    if (Number(productTables[0].total) > 0) {
      console.log("Products table already exists.");
    } else {
      console.log("Products table does not exist. Creating...");
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        product_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Check homepage table.
    const [homeTables] = await connection.execute(`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'home_page_data'
    `);

    if (Number(homeTables[0].total) > 0) {
      console.log("Home page table already exists.");
    } else {
      console.log("Home page table does not exist. Creating...");
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS home_page_data (
        id TINYINT UNSIGNED PRIMARY KEY,
        page_data JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("MySQL table check completed.");

  } finally {
    connection.release();
  }
}

// ==================================================
// JSON MIGRATION
// ==================================================

function parseJson(value) {
  return typeof value === "string"
    ? JSON.parse(value)
    : value;
}

async function migrateJsonDataToMySQL() {

  // Migrate products.
  if (fs.existsSync(PRODUCTS_FILE)) {

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
      throw new Error("Invalid productsData.json format.");
    }

    for (const [slug, product] of Object.entries(products)) {

      if (!product || typeof product !== "object") {
        console.warn(`Skipping invalid product: ${slug}`);
        continue;
      }

      await db.execute(
        `INSERT IGNORE INTO products
         (slug, product_data)
         VALUES (?, ?)`,
        [slug, JSON.stringify(product)]
      );
    }

    console.log("Products JSON migration checked.");

  } else {
    console.log("Products JSON file not found. Skipping migration.");
  }

  // Migrate homepage data only if record does not exist.
  const [homeRows] = await db.execute(
    "SELECT id FROM home_page_data WHERE id = 1"
  );

  if (homeRows.length === 0) {

    let homeData = {
      banners: [],
      about: {}
    };

    if (fs.existsSync(DATA_FILE)) {
      const content = await fsPromises.readFile(
        DATA_FILE,
        "utf8"
      );

      homeData = JSON.parse(content);
    }

    await db.execute(
      `INSERT INTO home_page_data
       (id, page_data)
       VALUES (1, ?)`,
      [JSON.stringify(homeData)]
    );

    console.log("Homepage data migrated.");

  } else {
    console.log("Homepage data already exists. Skipping migration.");
  }
}

// ==================================================
// DATABASE INITIALIZATION
// ==================================================

async function initializeDatabase() {

  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME"
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    throw new Error(
      "Missing database settings: " + missing.join(", ")
    );
  }

  await db.query("SELECT 1");

  console.log("MySQL connection successful.");

  await ensureDatabaseTables();

  await migrateJsonDataToMySQL();
}

// ==================================================
// ADMIN AUTHENTICATION
// ==================================================

function generateToken() {
  return crypto
    .createHash("sha256")
    .update(
      String(process.env.ADMIN_USERNAME || "") +
      ":" +
      String(process.env.ADMIN_PASSWORD || "") +
      ":" +
      String(process.env.ADMIN_TOKEN || "")
    )
    .digest("hex");
}

function authenticateAdmin(req, res, next) {

  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Authorization required"
    });
  }

  const token = authorization.slice(7);
  const validToken = generateToken();

  const a = Buffer.from(token);
  const b = Buffer.from(validToken);

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  next();
}

// ==================================================
// IMAGE UPLOAD
// ==================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, crypto.randomUUID() + ext);
  }

});

const upload = multer({

  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WebP images are allowed"));
  }

});

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/assets/uploads", express.static(UPLOAD_DIR));

app.post(
  "/api/upload",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image"
      });
    }

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`
    });

  }
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/health", async (req, res) => {

  try {

    await db.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      message: "DeltaTrafo server is healthy",
      database: "connected"
    });

  } catch (error) {

    console.error(error);

    res.status(503).json({
      status: "error",
      database: "disconnected"
    });

  }

});

// ==================================================
// REACT STATIC FILES
// ==================================================

app.use(express.static(FRONTEND_DIR));

// ==================================================
// PRODUCT HELPERS
// ==================================================

async function readProducts() {

  const [rows] = await db.query(
    "SELECT slug, product_data FROM products ORDER BY id ASC"
  );

  const products = {};

  for (const row of rows) {
    products[row.slug] = parseJson(row.product_data);
  }

  return products;
}

function createSlug(name) {

  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

}

function validProduct(product) {

  return (
    product &&
    typeof product === "object" &&
    !Array.isArray(product) &&
    typeof product.name === "string" &&
    product.name.trim() !== "" &&
    typeof product.description === "string" &&
    Array.isArray(product.images) &&
    product.images.every(
      (image) => typeof image === "string"
    ) &&
    Array.isArray(product.specifications) &&
    product.specifications.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 2 &&
        row.every(
          (value) => typeof value === "string"
        )
    )
  );

}

// ==================================================
// PRODUCTS API
// ==================================================

// GET all products.
app.get("/api/products", async (req, res) => {

  try {

    const products = await readProducts();

    res.json(products);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load products"
    });

  }

});

// GET single product.
app.get("/api/products/:slug", async (req, res) => {

  try {

    const [rows] = await db.execute(
      "SELECT product_data FROM products WHERE slug = ?",
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(parseJson(rows[0].product_data));

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load product"
    });

  }

});

// ADD product.
app.post("/api/products", authenticateAdmin, async (req, res) => {

  try {

    const product = req.body;

    if (!validProduct(product)) {
      return res.status(400).json({
        message: "Invalid product data"
      });
    }

    const slug = createSlug(product.slug || product.name);

    if (!slug) {
      return res.status(400).json({
        message: "Invalid product slug"
      });
    }

    const productData = { ...product };

    delete productData.slug;

    await db.execute(
      `INSERT INTO products (slug, product_data)
       VALUES (?, ?)`,
      [slug, JSON.stringify(productData)]
    );

    res.status(201).json({
      slug,
      product: productData
    });

  } catch (error) {

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Product already exists"
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Unable to add product"
    });

  }

});

// UPDATE product.
app.put("/api/products/:slug", authenticateAdmin, async (req, res) => {

  try {

    const slug = req.params.slug;
    const product = req.body;

    if (!validProduct(product)) {
      return res.status(400).json({
        message: "Invalid product data"
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM products WHERE slug = ?",
      [slug]
    );

    if (!existing.length) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const productData = { ...product };

    delete productData.slug;

    await db.execute(
      `UPDATE products
       SET product_data = ?
       WHERE slug = ?`,
      [JSON.stringify(productData), slug]
    );

    res.json({
      slug,
      product: productData
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to update product"
    });

  }

});

// DELETE product.
app.delete("/api/products/:slug", authenticateAdmin, async (req, res) => {

  try {

    const [result] = await db.execute(
      "DELETE FROM products WHERE slug = ?",
      [req.params.slug]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to delete product"
    });

  }

});

// ==================================================
// ADMIN LOGIN
// ==================================================

app.post("/api/admin/login", (req, res) => {

  const { username, password } = req.body || {};

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

  res.json({
    success: true,
    message: "Login successful",
    token: generateToken()
  });

});

// ==================================================
// HOMEPAGE DATA HELPERS
// ==================================================

async function readHomeData() {

  const [rows] = await db.execute(
    "SELECT page_data FROM home_page_data WHERE id = 1"
  );

  if (!rows.length) {
    throw new Error("Homepage data not found");
  }

  return parseJson(rows[0].page_data);

}

async function writeHomeData(data) {

  await db.execute(
    `INSERT INTO home_page_data (id, page_data)
     VALUES (1, ?)
     ON DUPLICATE KEY UPDATE page_data = VALUES(page_data)`,
    [JSON.stringify(data)]
  );

  return true;

}

// ==================================================
// HOMEPAGE API
// ==================================================

// GET homepage data.
app.get("/api/home-data", async (req, res) => {

  try {

    const data = await readHomeData();

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load homepage data"
    });

  }

});

// UPDATE homepage data.
app.put("/api/home-data", authenticateAdmin, async (req, res) => {

  try {

    const newData = req.body;

    if (
      !newData ||
      typeof newData !== "object" ||
      Array.isArray(newData)
    ) {
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

    if (
      !newData.about ||
      typeof newData.about !== "object" ||
      Array.isArray(newData.about)
    ) {
      return res.status(400).json({
        success: false,
        message: "about data is required"
      });
    }

    await writeHomeData(newData);

    res.json({
      success: true,
      message: "Home data updated successfully",
      data: newData
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to save homepage data"
    });

  }

});

// ==================================================
// UNKNOWN API ROUTES
// ==================================================

app.use("/api", (req, res) => {

  res.status(404).json({
    message: "API route not found"
  });

});

// ==================================================
// REACT ROUTER FALLBACK
// ==================================================

app.get("/{*splat}", (req, res) => {

  res.sendFile(
    path.join(FRONTEND_DIR, "index.html")
  );

});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {

  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 400).json({
    success: false,
    message: err.message || "Request failed"
  });

});

// ==================================================
// START SERVER AFTER DATABASE INITIALIZATION
// ==================================================

async function startServer() {

  try {

    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {

      console.log(`DeltaTrafo API running on port ${PORT}`);
      console.log("Database: MySQL connected");
      console.log(`Storage directory: ${STORAGE_DIR}`);

    });

  } catch (error) {

    console.error("Application startup failed:", error);

    process.exit(1);

  }

}

startServer();