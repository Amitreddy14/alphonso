const axios = require("axios");

app.get("/market-data", async (req, res) => {
  const { crop, timeRange, region } = req.query;
  try {
    const response = await axios.get("https://external-api.com/market", {
      params: { crop, timeRange, region },
    });
    res.json(response.data); // Format as needed
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});