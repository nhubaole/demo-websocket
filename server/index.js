import { Server as SocketIOServer } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const serverPort = 3001;

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const activeUsers = new Map();

function generateRandomName() {
  const names = ["Alex", "Sam", "Charlie", "Jordan", "Taylor", "Morgan", "Casey", "Jamie"];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomAvatar(id) {
  return `https://robohash.org/${id}?set=set4`;
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  const user = {
    id: socket.id,
    name: generateRandomName(),
    avatar: generateRandomAvatar(socket.id),
  };
  activeUsers.set(socket.id, user);

  socket.on("send_message", (data) => {
    io.emit("receive_message", { ...data, user });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers.delete(socket.id);
  });
});

server.listen(serverPort, () => {
  console.log(`Server is listening on port ${serverPort}`);
});
