import { Server } from "socket.io";
import * as chatService from "./Chat/chat.service.js";
import { socketAuth } from "./middlewares/socket.auth.middleware.js";

export let io;

export const runSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => socketAuth({ socket, next }));

  io.on("connection", (socket) => {
    console.log("a user connected");

    if (socket.user.role === "HR") {
      socket.join("HRs");
    }

    socket.on("sendMessage", chatService.sendMessage(socket, io));
    socket.on("getChat", chatService.getChat(socket, io));

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
