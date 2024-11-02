
# Demo Real-time Chat App

Ứng dụng chat thời gian thực đơn giản, được xây dựng với Node.js, Express, Socket.IO và React cùng Tailwind CSS. Ứng dụng cho phép người dùng kết nối và gửi tin nhắn thời gian thực.

## Demo
![Demo](./demo.gif)

## Hướng dẫn

### 1. Setup Server

1. Tạo thư mục `server` và điều hướng vào thư mục này:

   ```bash
   mkdir server
   cd server
   ```

2. Khởi tạo dự án Node.js mới và install tất cả dependencies cần thiết:

   ```bash
   npm init -y
   npm install express socket.io && npm install --save-dev nodemon
   ```

3. Tạo file `index.js`, tạo server và socket connection cơ bản như sau:

   ```javascript
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

   io.on("connection", (socket) => {
     console.log("New client connected:", socket.id);

     socket.on("disconnect", () => {
       console.log("User disconnected:", socket.id);
     });
   });

   server.listen(serverPort, () => {
     console.log(`Server is listening on port ${serverPort}`);
   });
   ```

### 2. Setup phía Client

1. Quay lại thư mục gốc của dự án và tạo thư mục cho client:

   ```bash
   cd ..
   npm create vite@latest client
   cd client
   ```

2. Cài đặt các dependencies cần thiết:

   ```bash
   npm install socket.io-client
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. Cấu hình Tailwind CSS trong `tailwind.config.js`:

   ```javascript
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

4. Import các style của Tailwind CSS trong `src/index.css`:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. Tạo file `socket.js` trong thư mục `src` để kết nối tới socket server:

   ```javascript
   import { io } from "socket.io-client";

   const SOCKET_SERVER_URL = "http://localhost:3001";
   const socket = io(SOCKET_SERVER_URL);

   export default socket;
   ```

6. Tạo component `Chat.js` trong thư mục `src`:

   ```javascript
   import React, { useState, useEffect } from "react";
   import socket from "./socket";

   function Chat() {

   }

   export default Chat;
   ```

7. Mở file `App.js` và import `Chat` để hiển thị giao diện chat:
     ```javascript
     import React from 'react';
     import Chat from "./Chat";

     function App() {
       return (
         <div>
           <Chat />
         </div>
       );
     }

     export default App;
     ```

### 3. Quản lý người dùng

1. Trong `index.js`, thêm một Map để lưu các người dùng đang kết nối và xoá ra khi người dùng disconnect

     ```javascript
     const activeUsers = new Map();

     function generateRandomName() {
       const names = ["Alex", "Sam", "Charlie", "Jordan", "Taylor", "Morgan", "Casey", "Jamie"];
       return names[Math.floor(Math.random() * names.length)];
     }

     function generateRandomAvatar(id) {
       return `https://robohash.org/${id}?set=set4`;
     }

     io.on("connection", (socket) => {
       const user = {
         id: socket.id,
         name: generateRandomName(),
         avatar: generateRandomAvatar(socket.id),
       };
       activeUsers.set(socket.id, user);

       socket.on("disconnect", () => {
         activeUsers.delete(socket.id);
       });
     });
     ```

### 4. Xử lý gửi và nhận tin nhắn

1. Bổ sung sự kiện cho server:

    Lắng nghe sự kiện `send_message` và gửi tin nhắn cho tất cả các client đang kết nối như sau:

     ```javascript
     io.on("connection", (socket) => {
       socket.on("send_message", (data) => {
         io.emit("receive_message", { ...data, user: activeUsers.get(socket.id) });
       });
     });
     ```

2. Phía client, lắng nghe sự kiện `receive_message` từ server để hiển thị tin nhắn:

     ```javascript
     useEffect(() => {
       socket.on("connect", () => {
         setUserId(socket.id);
       });

       socket.on("receive_message", (data) => {
         setMessages((prevMessages) => [...prevMessages, data]);
       });
     }, []);
     ```
    và gọi `send_message` để gửi tin nhắn khi người dùng nhấn nút gửi
    ```
    const sendMessage = () => {
        if (message.trim()) {
          setMessage("");
          const messageData = {
            content: message,
            timestamp: new Date(),
            user: {
              id: userId,
            },
          };
          socket.emit("send_message", messageData);
        }
    };
    ```

### 5. Chạy ứng dụng 🚀

- Chạy server:
  ```bash
  cd server
  node index.js
  ```

- Chạy client:
  ```bash
  cd client
  npm run dev
  ```