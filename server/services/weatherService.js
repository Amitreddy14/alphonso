const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "../.env" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Google Generative AI Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Fetch Weather Insights Using Gemini AI
const fetchWeatherFromAI = async (location, date) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Prompt to get weather insights
        const prompt = `
            Provide a detailed weather forecast for ${location} on ${date}.
            Include temperature, precipitation, wind conditions, and any extreme weather warnings.
            The response should be in JSON format.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text(); // Extract AI-generated text

        return JSON.parse(text); // Ensure the output is a structured JSON object
    } catch (error) {
        console.error("Error fetching weather from Gemini AI:", error);
        throw new Error("Failed to fetch weather insights");
    }
};

module.exports = { fetchWeatherFromAI };
