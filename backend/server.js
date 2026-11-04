
"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const mysql = require("mysql2/promise");

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_DIR = path.join(__dirname, "..", "dist");

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ==================================================
// PERSISTENT LOCAL STORAGE
// ==================================================

const DATA_DIR = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "delta-storage",
  "data"
);

const UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "delta-storage",
  "uploads"
);

const SEED_DIR = path.join(__dirname, "seed");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const DATA_FILE = path.join(DATA_DIR, "homePageData.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "productsData.json");

for (const file of ["homePageData.json", "productsData.json"]) {
  const target = path.join(DATA_DIR, file);
  const seed = path.join(SEED_DIR, file);

  if (!fs.existsSync(target) && fs.existsSync(seed)) {
    fs.copyFileSync(seed, target);
  }
}

// ==================================================
// MYSQL
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

async function ensureDatabaseTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      product_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS home_page_data (
      id TINYINT UNSIGNED PRIMARY KEY,
      page_data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

function parseJson(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

async function migrateJsonDataToMySQL() {
  if (fs.existsSync(PRODUCTS_FILE)) {
    const products = JSON.parse(
      await fsPromises.readFile(PRODUCTS_FILE, "utf8")
    );

    if (
      !products ||
      typeof products !== "object" ||
      Array.isArray(products)
    ) {
      throw new Error("Invalid productsData.json format");
    }

    for (const [slug, product] of Object.entries(products)) {
      if (!product || typeof product !== "object") continue;

      await db.execute(
        `INSERT IGNORE INTO products (slug, product_data)
         VALUES (?, ?)`,
        [slug, JSON.stringify(product)]
      );
    }
  }

  const [rows] = await db.execute(
    "SELECT id FROM home_page_data WHERE id = 1"
  );

  if (rows.length === 0) {
    let homeData = { banners: [], about: {} };

    if (fs.existsSync(DATA_FILE)) {
      homeData = JSON.parse(
        await fsPromises.readFile(DATA_FILE, "utf8")
      );
    }

    await db.execute(
      "INSERT INTO home_page_data (id, page_data) VALUES (1, ?)",
      [JSON.stringify(homeData)]
    );
  }
}

async function initializeDatabase() {
  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME"
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(
      "Missing database environment variables: " + missing.join(", ")
    );
  }

  await db.query("SELECT 1");
  await ensureDatabaseTables();
  await migrateJsonDataToMySQL();

  console.log("MySQL connected");
}

// ==================================================
// AWS S3
// ==================================================

const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET_NAME;

const s3 = new S3Client({
  region: AWS_REGION,

  ...(process.env.AI_AK &&
  process.env.SA_KA
    ? {
        credentials: {
          accessKeyId: process.env.AI_AK,
          secretAccessKey: process.env.SA_KA
        }
      }
    : {})
});

const S3_PUBLIC_BASE_URL =
  process.env.S3_PUBLIC_BASE_URL ||
  (S3_BUCKET && AWS_REGION
    ? `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`
    : "");

function getS3Url(key) {
  return `${S3_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function validateS3Config() {
  if (!AWS_REGION || !S3_BUCKET) {
    throw new Error("AWS_REGION or S3_BUCKET_NAME is missing");
  }

  if (
    !process.env.AI_AK ||
    !process.env.SA_KA
  ) {
    console.warn(
      "AWS credentials not explicitly configured. Checking default AWS credentials."
    );
  }
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

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required"
    });
  }

  const token = authorization.slice(7);
  const expected = generateToken();

  const actualBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  next();
}

// ==================================================
// IMAGE VALIDATION
// ==================================================

const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"]
};

// Preserve original filename.
// Example: insulation-board.jpg

function getSafeOriginalFilename(originalname) {
  const filename = path.basename(
    String(originalname || "").replace(/\\/g, "/")
  );

  if (
    !filename ||
    filename === "." ||
    filename === ".." ||
    /[\x00-\x1f\x7f]/.test(filename)
  ) {
    throw new Error("Invalid image filename");
  }

  const ext = path.extname(filename).toLowerCase();

  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    throw new Error("Invalid image extension");
  }

  return filename;
}

function isValidTempFilename(filename) {
  if (typeof filename !== "string") return false;

  try {
    return getSafeOriginalFilename(filename) === filename;
  } catch {
    return false;
  }
}

// ==================================================
// MULTER TEMPORARY STORAGE
// ==================================================

const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    try {
      cb(null, getSafeOriginalFilename(file.originalname));
    } catch (error) {
      cb(error);
    }
  }
});

const tempUpload = multer({
  storage: tempStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },

  fileFilter: (req, file, cb) => {
    const extensions = ALLOWED_TYPES[file.mimetype];

    if (!extensions) {
      return cb(
        new Error("Only JPG, PNG and WebP images are allowed")
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();

    if (!extensions.includes(ext)) {
      return cb(new Error("Image extension does not match its file type"));
    }

    cb(null, true);
  }
});

// ==================================================
// STEP 1: UPLOAD IMAGE TO LOCAL STORAGE
// ==================================================

app.post(
  "/api/upload",
  authenticateAdmin,
  tempUpload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image"
      });
    }

    const filename = req.file.filename;

    res.status(201).json({
      success: true,
      tempId: filename,
      imageUrl:
        `/api/temp-images/${encodeURIComponent(filename)}`,
      originalName: req.file.originalname,
      message: "Image saved temporarily"
    });
  }
);

// ==================================================
// TEMPORARY IMAGE PREVIEW
// ==================================================

// The image URL is used by the React img element.
// This route does not require an Authorization header.

app.get("/api/temp-images/:tempId", (req, res) => {
  const filename = req.params.tempId;

  if (!isValidTempFilename(filename)) {
    return res.status(400).send("Invalid image filename");
  }

  const imagePath = path.join(UPLOAD_DIR, filename);

  res.sendFile(imagePath, (error) => {
    if (error && !res.headersSent) {
      res.status(404).send("Temporary image not found");
    }
  });
});

// ==================================================
// STEP 2: UPLOAD TEMPORARY IMAGE TO S3
// ==================================================

async function uploadTempImageToS3(tempId) {
  if (!isValidTempFilename(tempId)) {
    throw new Error("Invalid temporary image filename");
  }

  const localPath = path.join(UPLOAD_DIR, tempId);

  const buffer = await fsPromises.readFile(localPath);

  const ext = path.extname(tempId).toLowerCase();

  const contentTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
  };

  // Original filename is preserved in the S3 key.
  const s3Key = `products/${tempId}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentTypes[ext],
      CacheControl: "public, max-age=31536000"
    })
  );

  return {
    imageUrl: getS3Url(s3Key),
    s3Key,
    localPath
  };
}

// ==================================================
// RESOLVE PRODUCT IMAGES
// ==================================================

async function resolveProductImages(images, uploadedKeys) {
  if (!Array.isArray(images)) {
    throw new Error("Product images must be an array");
  }

  const finalImages = [];

  for (const image of images) {
    if (typeof image !== "string") {
      throw new Error("Each product image must be a string");
    }

    if (!image.trim()) continue;

    let tempId = "";

    // React temporary preview URL
    if (image.startsWith("/api/temp-images/")) {
      const encodedFilename = image.slice(
        "/api/temp-images/".length
      );

      try {
        tempId = decodeURIComponent(encodedFilename);
      } catch {
        throw new Error("Invalid temporary image URL");
      }
    }

    // Explicit temporary filename
    else if (image.startsWith("temp:")) {
      tempId = image.slice(5);
    }

    // Direct temporary filename
    else if (isValidTempFilename(image)) {
      tempId = image;
    }

    // Existing S3 or external image
    else if (/^https?:\/\//i.test(image)) {
      finalImages.push(image);
      continue;
    }

    else {
      throw new Error(`Invalid product image: ${image}`);
    }

    if (!isValidTempFilename(tempId)) {
      throw new Error("Invalid temporary image filename");
    }

    const localPath = path.join(UPLOAD_DIR, tempId);

    try {
      await fsPromises.access(localPath);
    } catch {
      throw new Error(`Temporary image not found: ${tempId}`);
    }

    const uploaded = await uploadTempImageToS3(tempId);

    uploadedKeys.push(uploaded.s3Key);

    finalImages.push(uploaded.imageUrl);
  }

  return finalImages;
}

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      status: "ok",
      message: "DeltaTrafo server is healthy",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  }
});

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

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validProduct(product) {
  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product)
  ) {
    return false;
  }

  if (
    typeof product.name !== "string" ||
    !product.name.trim()
  ) {
    return false;
  }

  if (
    typeof product.description !== "string"
  ) {
    return false;
  }

  if (!Array.isArray(product.images)) {
    return false;
  }

  if (
    !product.images.every(
      (image) => typeof image === "string"
    )
  ) {
    return false;
  }

  if (!Array.isArray(product.specifications)) {
    return false;
  }

  return product.specifications.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 2 &&
      row.every((value) => typeof value === "string")
  );
}

async function deleteUploadedS3Objects(keys) {
  return Promise.allSettled(
    keys.map((key) =>
      s3.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: key
        })
      )
    )
  );
}

// ==================================================
// SAVE PRODUCT
// ==================================================

async function saveProduct(slug, product, isUpdate) {
  const uploadedKeys = [];

  try {
    const finalImages = await resolveProductImages(
      product.images,
      uploadedKeys
    );

    const productData = {
      ...product,
      images: finalImages
    };

    delete productData.slug;

    if (isUpdate) {
      const [result] = await db.execute(
        `UPDATE products
         SET product_data = ?
         WHERE slug = ?`,
        [JSON.stringify(productData), slug]
      );

      if (!result.affectedRows) {
        await deleteUploadedS3Objects(uploadedKeys);

        return {
          status: 404,
          body: {
            success: false,
            message: "Product not found"
          }
        };
      }
    } else {
      await db.execute(
        `INSERT INTO products (slug, product_data)
         VALUES (?, ?)`,
        [slug, JSON.stringify(productData)]
      );
    }

    // Delete local temporary images only after MySQL succeeds.
    for (const image of product.images) {
      if (typeof image !== "string") continue;

      let tempId = "";

      if (image.startsWith("/api/temp-images/")) {
        try {
          tempId = decodeURIComponent(
            image.slice("/api/temp-images/".length)
          );
        } catch {
          continue;
        }
      } else if (image.startsWith("temp:")) {
        tempId = image.slice(5);
      } else if (isValidTempFilename(image)) {
        tempId = image;
      }

      if (isValidTempFilename(tempId)) {
        await fsPromises.unlink(
          path.join(UPLOAD_DIR, tempId)
        ).catch((error) => {
          if (error.code !== "ENOENT") {
            console.error(
              "Temporary cleanup failed:",
              error.message
            );
          }
        });
      }
    }

    return {
      status: isUpdate ? 200 : 201,
      body: {
        success: true,
        slug,
        product: productData
      }
    };

  } catch (error) {
    // Delete new S3 objects if the database save fails.
    await deleteUploadedS3Objects(uploadedKeys);

    throw error;
  }
}

// ==================================================
// PRODUCTS API
// ==================================================

app.get("/api/products", async (req, res) => {
  try {
    res.json(await readProducts());
  } catch (error) {
    console.error("Read products failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load products"
    });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT product_data FROM products WHERE slug = ?",
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json(parseJson(rows[0].product_data));

  } catch (error) {
    console.error("Read product failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load product"
    });
  }
});

// ADD PRODUCT

app.post("/api/products", authenticateAdmin, async (req, res) => {
  try {
    const product = req.body;

    if (!validProduct(product)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data"
      });
    }

    const slug = createSlug(product.slug || product.name);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Invalid product slug"
      });
    }

    const result = await saveProduct(slug, product, false);

    res.status(result.status).json(result.body);

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Product already exists"
      });
    }

    console.error("Add product failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to add product",
      error: error.message
    });
  }
});

// UPDATE PRODUCT

app.put(
  "/api/products/:slug",
  authenticateAdmin,
  async (req, res) => {
    try {
      const product = req.body;

      if (!validProduct(product)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product data"
        });
      }

      const result = await saveProduct(
        req.params.slug,
        product,
        true
      );

      res.status(result.status).json(result.body);

    } catch (error) {
      console.error("Update product failed:", error.message);

      res.status(500).json({
        success: false,
        message: "Unable to update product",
        error: error.message
      });
    }
  }
);

// DELETE PRODUCT

app.delete(
  "/api/products/:slug",
  authenticateAdmin,
  async (req, res) => {
    try {
      const [result] = await db.execute(
        "DELETE FROM products WHERE slug = ?",
        [req.params.slug]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully"
      });

    } catch (error) {
      console.error("Delete product failed:", error.message);

      res.status(500).json({
        success: false,
        message: "Unable to delete product"
      });
    }
  }
);

// ==================================================
// ADMIN LOGIN
// ==================================================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
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
// HOMEPAGE DATA
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
}

app.get("/api/home-data", async (req, res) => {
  try {
    res.json({
      success: true,
      data: await readHomeData()
    });

  } catch (error) {
    console.error("Read homepage data failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load homepage data"
    });
  }
});

app.put(
  "/api/home-data",
  authenticateAdmin,
  async (req, res) => {
    try {
      const data = req.body;

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        !Array.isArray(data.banners) ||
        !data.about ||
        typeof data.about !== "object" ||
        Array.isArray(data.about)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid homepage data"
        });
      }

      await writeHomeData(data);

      res.json({
        success: true,
        message: "Homepage data updated successfully",
        data
      });

    } catch (error) {
      console.error("Save homepage data failed:", error.message);

      res.status(500).json({
        success: false,
        message: "Unable to save homepage data"
      });
    }
  }
);

// ==================================================
// API NOT FOUND
// ==================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// ==================================================
// REACT STATIC FILES AND SPA FALLBACK
// ==================================================

app.use(express.static(FRONTEND_DIR));

app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(FRONTEND_DIR, "index.html")
  );
});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 400).json({
    success: false,
    message: err.message || "Request failed"
  });
});

// ==================================================
// START SERVER
// ==================================================

async function startServer() {
  try {
    validateS3Config();

    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`DeltaTrafo server running on port ${PORT}`);
      console.log("MySQL connected");
      console.log(`Temporary uploads: ${UPLOAD_DIR}`);
    });

  } catch (error) {
    console.error(
      "Application startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
