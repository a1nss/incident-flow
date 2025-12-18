const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http"); // New import
const { Server } = require("socket.io"); // New import
require("dotenv").config();

const app = express();
const server = http.createServer(app); // Create HTTP server manually

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your frontend to connect
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Attach 'io' to every request so routes can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/incidents", require("./routes/incidents"));

// WebSocket Connection Logic
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "IncidentFlow API is active" });
});

// Start Server (Change 'app.listen' to 'server.listen')
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});