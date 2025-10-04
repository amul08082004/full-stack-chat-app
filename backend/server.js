const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const cors = require("cors");
const http = require("http"); // for socket.io server
const { Server } = require("socket.io"); // socket.io
const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/message.js");
const connectDB = require("./lib/db.js");

const app = express();
const server = http.createServer(app); // create HTTP server for socket.io
const __dirname = path.resolve();

// ----------------- Middleware -----------------
app.use(express.json({ limit: "10mb" })); // allow up to 10MB
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
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Track online users: array of { userId, socketId } (kept this name)
let onlineUsers = [];
// Keep same name, but now maps userId -> [socketId, ...]
let userIdMap = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // ----------------- Join -----------------
  socket.on("join", ({ userId }) => {
    console.log(`User joined: ${userId} (socket: ${socket.id})`);

    // ensure array exists for this userId in userIdMap
    if (!userIdMap[userId]) {
      userIdMap[userId] = [];
    }
    // add socket.id if not present
    if (!userIdMap[userId].includes(socket.id)) {
      userIdMap[userId].push(socket.id);
    }

    // keep onlineUsers array as you had it (we push per socket)
    // this preserves your variable name and overall shape
    onlineUsers.push({ userId, socketId: socket.id });

    // Emit updated online users to all clients
    io.emit("onlineusers", onlineUsers);
  });

  socket.on("send", ({ senderId, receiverId, text, image }) => {
    // look up all socketIds for the receiver (userIdMap kept same name)
    const receiverSocketIds = userIdMap[receiverId] || [];
    receiverSocketIds.forEach((sockId) => {
      io.to(sockId).emit("receive", { senderId, receiverId, text, image });
    });
  });

  // ----------------- Disconnect -----------------
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove user from onlineUsers (same logic you used)
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    // Remove this socket id from userIdMap (same variable name)
    for (const userId in userIdMap) {
      userIdMap[userId] = userIdMap[userId].filter((id) => id !== socket.id);
      if (userIdMap[userId].length === 0) {
        delete userIdMap[userId];
      }
    }

    // Emit updated online users to all clients
    io.emit("onlineusers", onlineUsers);
  });
});

// ----------------- Production -----------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5001;

// start server only after DB connects
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
