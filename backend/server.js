const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/message.js");
const connectDB = require("./lib/db.js");

const app = express();
const server = http.createServer(app);

// ----------------- Fix __dirname -----------------
const __dirnameFixed = typeof __dirname === "undefined" ? path.resolve() : __dirname;

// ----------------- Middleware -----------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ----------------- Routes -----------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ----------------- Socket.IO -----------------
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

let onlineUsers = [];
let userIdMap = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", ({ userId }) => {
    console.log(`User joined: ${userId} (socket: ${socket.id})`);
    if (!userIdMap[userId]) userIdMap[userId] = [];
    if (!userIdMap[userId].includes(socket.id)) userIdMap[userId].push(socket.id);
    onlineUsers.push({ userId, socketId: socket.id });
    io.emit("onlineusers", onlineUsers);
  });

  socket.on("send", ({ senderId, receiverId, text, image }) => {
    (userIdMap[receiverId] || []).forEach((sockId) => {
      io.to(sockId).emit("receive", { senderId, receiverId, text, image });
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    for (const userId in userIdMap) {
      userIdMap[userId] = userIdMap[userId].filter((id) => id !== socket.id);
      if (userIdMap[userId].length === 0) delete userIdMap[userId];
    }
    io.emit("onlineusers", onlineUsers);
  });
});

// ----------------- Production -----------------
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirnameFixed, "../frontend/dist");
  app.use(express.static(frontendPath));

  // Regex route to handle all frontend paths except API
  app.get(/(.*)/, (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log("Server running on port", PORT));
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
