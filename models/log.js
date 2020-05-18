const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: "",
  nutrients: {
    Kcal: 0,
    carb: 0,
    prot: 0,
    fat: 0,
  },
});

const daySchema = new mongoose.Schema({
  totalKcal: 0,
  totalCarbs: 0,
  totalProtein: 0,
  totalFat: 0,
  dia: "",
  foods: [foodSchema],
});

const monthSchema = new mongoose.Schema({
  userId: "03048100373750",
  logs: [
    {
      totalKcal: 3000,
      totalCarbs: 400,
      totalProtein: 200,
      totalFat: 100,
      month: "April",
      year: "2000",
      days: [daySchema],
    },
  ],
});

const Log = mongoose.model("log", monthSchema);

module.exports = Log;
