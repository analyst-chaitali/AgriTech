
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Farm = require("./models/Farm");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "AgriTech API is running successfully!",
    status: "success",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    project: "AgriTech",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// GET: Fetch all farms
app.get("/api/farms", async (req, res) => {
  try {
    const farms = await Farm.find().sort({ createdAt: -1 });
    res.status(200).json(farms);
  } catch (error) {
    console.error("Fetch farms error:", error.message);
    res.status(500).json({
      message: "Failed to fetch farms",
      error: error.message,
    });
  }
});

// GET: Fetch one farm by ID
app.get("/api/farms/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid farm ID" });
    }

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    res.status(200).json(farm);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farm",
      error: error.message,
    });
  }
});

// POST: Add a new farm
app.post("/api/farms", async (req, res) => {
  try {
    const { farmName, farmerName, location, size, cropType } = req.body;

    const farm = await Farm.create({
      farmName,
      farmerName,
      location,
      size,
      cropType,
    });

    res.status(201).json({
      message: "Farm added successfully",
      farm,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add farm",
      error: error.message,
    });
  }
});

// PUT: Update a farm
app.put("/api/farms/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid farm ID" });
    }

    const allowedFields = [
      "farmName",
      "farmerName",
      "location",
      "size",
      "cropType",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    res.status(200).json({
      message: "Farm updated successfully",
      farm,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update farm",
      error: error.message,
    });
  }
});

// DELETE: Remove a farm
app.delete("/api/farms/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid farm ID" });
    }

    const farm = await Farm.findByIdAndDelete(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    res.status(200).json({
      message: "Farm deleted successfully",
      farm,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete farm",
      error: error.message,
    });
  }
});

// Start server only after database connection
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI missing in server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`AgriTech server running at http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Farms: http://localhost:${PORT}/api/farms`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
