const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fetchWeatherFromAI = async (req, res) => {
    try {
        const { location, date } = req.body;

        if (!location || !date) {
            return res.status(400).json({ error: "Location and date are required" });
        }

        // Generate a weather forecast prompt
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Provide a weather forecast for ${location} on ${date} with farming insights.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({
            location,
            date,
            forecast: response || "Weather data unavailable",
        });

    } catch (error) {
        res.status(500).json({ error: "AI weather generation failed" });
    }
};

module.exports = { fetchWeatherFromAI };
