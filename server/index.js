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
connectDatabase();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/weather", weatherRoutes);

// Serial Port setup for COM5
const serialPort = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

serialPort.on("open", () => console.log("Serial port opened on COM5"));
serialPort.on("error", (err) => console.error("Serial port error:", err));

// Express server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.on("close", () => console.log("WebSocket client disconnected"));
});

// Parse and broadcast soil moisture data
parser.on("data", (data) => {
  const match = data.match(/Soil Moisture: (\d+)/);
  if (match) {
    const moisture = parseInt(match[1]);
    console.log(`Soil Moisture: ${moisture}%`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "soilMoisture", value: moisture }));
      }
    });
  }
});