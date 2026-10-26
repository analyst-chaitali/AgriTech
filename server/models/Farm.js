
const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    farmName: {
      type: String,
      required: true,
      trim: true,
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0.01,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);
