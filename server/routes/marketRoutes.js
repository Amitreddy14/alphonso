const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/market-prices/:commodity', async (req, res) => {
  const { commodity } = req.params;
  const QUANDL_API_KEY = process.env.QUANDL_API_KEY;

  if (!QUANDL_API_KEY) {
    console.error('QUANDL_API_KEY is not defined');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const datasetMap = {
    rice: 'ODA/PRICE_IND', // Free dataset for rice prices in India
    wheat: 'ODA/PWHEATM_USD' // Global wheat prices (convert to INR if needed)
  };
  const datasetCode = datasetMap[commodity.toLowerCase()];
  if (!datasetCode) return res.status(400).json({ error: 'Invalid commodity' });

  try {
    const response = await axios.get(
      `https://data.nasdaq.com/api/v3/datasets/${datasetCode}.json?api_key=${QUANDL_API_KEY}&limit=30`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    const data = response.data.dataset;
    if (!data || !data.data) throw new Error('No data available');

    const prices = data.data.map(row => ({
      date: row[0],
      price: datasetCode === 'ODA/PWHEATM_USD' ? row[1] * 82 * 100 : row[1] // Convert wheat USD/ton to ₹/quintal
    }));

    res.json(prices);
  } catch (error) {
    console.error('Error fetching Nasdaq Data Link data:', error.response?.status, error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch market data', details: error.message });
  }
});

module.exports = router;