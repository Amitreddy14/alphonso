const express = require("express");
const { fetchWeatherFromAI } = require("../controllers/weatherController");

const router = express.Router();

// Route to get AI-generated weather forecast
router.post("/", fetchWeatherFromAI);

module.exports = router;
