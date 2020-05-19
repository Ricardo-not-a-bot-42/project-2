const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
  nutrients: {
    Kcal: {
      type: Number,
    },
    carb: {
      type: Number,
    },
    prot: {
      type: Number,
    },
    fat: {
      type: Number,
    },
  },
});

const daySchema = new mongoose.Schema({
  totalKcal: {
    type: Number,
    default: 0,
  },
  totalCarbs: {
    type: Number,
    default: 0,
  },
  totalProtein: {
    type: Number,
    default: 0,
  },
  totalFat: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    required: true,
  },
  foods: [foodSchema],
});

const monthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  totalKcal: {
    type: Number,
    default: 0,
  },
  totalCarbs: {
    type: Number,
    default: 0,
  },
  totalProtein: {
    type: Number,
    default: 0,
  },
  totalFat: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  day: [daySchema],
});

const Log = mongoose.model("Log", monthSchema);

module.exports = Log;
