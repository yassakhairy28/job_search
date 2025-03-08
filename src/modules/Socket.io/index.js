import { Server } from "socket.io";
import * as chatService from "./Chat/chat.service.js";
import { socketAuth } from "./middlewares/socket.auth.middleware.js";

export const runSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => socketAuth({ socket, next }));

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("sendMessage", chatService.sendMessage(socket, io));
    socket.on("getChat", chatService.getChat(socket, io));
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
