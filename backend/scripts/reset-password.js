/*
  Usage:
    node reset-password.js email@example.com newPassword
  Make sure MONGODB_URI is set in backend/config.env or exported in environment.
*/

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load env from backend/config.env if exists
const envPath = path.join(__dirname, "..", "config.env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  require("dotenv").config();
}

const User = require("../models/User");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node reset-password.js email newPassword");
    process.exit(1);
  }

  const [email, newPassword] = args;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error(
      "MONGODB_URI not set. Please set it in backend/config.env or environment."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found:", email);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`Password for ${email} has been reset.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
}

main();
