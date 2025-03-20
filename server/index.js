const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const WebSocket = require("ws");
require("dotenv").config({ path: "../.env" });
const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();

// Connect to the database
connectDatabase();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/weather", weatherRoutes);

// Serial Port setup for COM5
const SERIAL_PORT_PATH = "COM5"; // Make this configurable if needed
const BAUD_RATE = 9600;

const serialPort = new SerialPort({ path: SERIAL_PORT_PATH, baudRate: BAUD_RATE });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

// Serial Port event handlers
serialPort.on("open", () => {
  console.log(`Serial port opened on ${SERIAL_PORT_PATH}`);
});

serialPort.on("error", (err) => {
  console.error("Serial port error:", err.message);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Express server setup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket server setup
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  
  // Send a welcome message to the client
  ws.send(JSON.stringify({ type: "connection", message: "Connected to soil moisture server" }));

  ws.on("message", (message) => {
    console.log(`Received message from client: ${message}`);
    // Handle client messages if needed (e.g., commands to reset or request data)
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

// Parse and broadcast soil moisture data
parser.on("data", (data) => {
  try {
    const trimmedData = data.trim();
    const match = trimmedData.match(/Soil Moisture: (\d+)/);
    if (match) {
      const moisture = parseInt(match[1]);
      console.log(`Soil Moisture: ${moisture}%`);

      // Broadcast to all connected WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "soilMoisture", value: moisture }));
        }
      });
    } else {
      console.log(`Unrecognized data format: ${trimmedData}`);
    }
  } catch (err) {
    console.error("Error parsing serial data:", err.message);
  }
});

// Graceful shutdown handling
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);

function shutDown() {
  console.log("Received shutdown signal. Closing server...");
  server.close(() => {
    console.log("HTTP server closed.");
  });
  serialPort.close((err) => {
    if (err) {
      console.error("Error closing serial port:", err.message);
    } else {
      console.log("Serial port closed.");
    }
  });
  wss.clients.forEach((client) => client.close());
  setTimeout(() => process.exit(0), 1000); // Force exit after 1s
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  shutDown();
});
