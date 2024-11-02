import React, { useState, useEffect, useRef } from "react";
import socket from "./socket";
import { IoSend } from "react-icons/io5";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setUserId(socket.id);
    });

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex items-center pb-4 border-b">
        <h2 className="font-semibold text-lg">Public Chat Channel</h2>
      </div>

      <div className="flex-1 overflow-y-auto my-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end ${
              msg.user.id === userId ? "justify-end" : "justify-start"
            }`}
          >
            {msg.user.id !== userId && (
              <img
                src={msg.user.avatar}
                alt={`${msg.user.name}'s avatar`}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <div
              className={`p-3 rounded-lg text-sm max-w-xs ${
                msg.user.id === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p>{msg.content}</p>
              <small className="text-xs text-gray-400 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {}
      </div>

      <div className="flex items-center border-t pt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhấn vào đây để chat"
          className="flex-1 p-2 border rounded-full outline-none mr-2"
        />
        <button
          onClick={sendMessage}
          className="p-2 rounded-full bg-blue-500 text-white"
        >
          <IoSend />
        </button>
      </div>
    </div>
  );
}

export default Chat;
