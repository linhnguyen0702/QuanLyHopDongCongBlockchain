const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (fix X-Forwarded-For header issue)
app.set("trust proxy", 1);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Create default admin user if not exists
    const User = require("./models/User");
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (!adminExists) {
      const adminUser = new User({
        username: "admin",
        email: "admin@example.com",
        password: "password123",
        fullName: "System Administrator",
        role: "admin",
        department: "IT",
        isActive: true,
      });

      await adminUser.save();
      console.log(
        "✅ Default admin user created: admin@example.com / password123"
      );
    }

    // Initialize blockchain service
    const blockchainService = require("./services/blockchainService");
    const blockchainInitialized = await blockchainService.initialize();
    if (blockchainInitialized) {
      console.log("✅ Blockchain service initialized successfully");
    } else {
      console.log("⚠️  Blockchain service is disabled or failed to initialize");
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000"],
    credentials: true,
  })
);

// Relax img-src CSP for local uploads in development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data: http://localhost:5000; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests"
    );
    // Disable caching in development to prevent 304 issues
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // Fix for development environment
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return process.env.NODE_ENV === "development" && req.ip === "127.0.0.1";
  },
});
app.use("/api/", limiter);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files - serve uploads directory with CORS headers
const uploadsPath = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  (req, res, next) => {
    // Set CORS headers for static files
    res.header(
      "Access-Control-Allow-Origin",
      process.env.NODE_ENV === "production"
        ? "https://yourdomain.com"
        : "http://localhost:3000"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  },
  express.static(uploadsPath)
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contracts", require("./routes/contracts"));
app.use("/api/contractors", require("./routes/contractors"));
app.use("/api/users", require("./routes/users"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/security", require("./routes/security"));
app.use("/api/settings", require("./routes/settings"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Contract Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
