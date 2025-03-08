import chatModel from "../../../DB/models/chat.model.js";
import companyModel from "../../../DB/models/company.model.js";
import * as DBservices from "../../../DB/DBservices.js";

export const sendMessage = (socket, io) => {
  return async (data) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "User not authenticated" });
      }

      const { message, companyName, receiverId } = data;
      const senderId = socket.user._id;

      if (!receiverId || !message) {
        return socket.emit("error", { message: "Invalid message data" });
      }

      let chat = await DBservices.findOne({
        model: chatModel,
        data: { senderId, receiverId },
      });

      if (!chat) {
        // if not found, check if the user has permission to start a new chat
        const permission = await DBservices.findOne({
          model: companyModel,
          data: {
            companyName,
            $or: [{ HRs: { $in: [senderId] } }, { createdBy: senderId }],
          },
        });

        if (!permission) {
          return socket.emit("error", { message: "You can't start new chat" });
        }

        chat = await DBservices.create({
          model: chatModel,
          data: {
            senderId,
            receiverId,
            companyName,
            messages: [{ senderId, message }],
          },
        });
      } else {
        chat = await DBservices.findOneAndUpdate({
          model: chatModel,
          filter: { senderId, receiverId },
          data: { $push: { messages: { senderId, message } } },
          options: { new: true },
        });
      }

      io.to(receiverId).emit("newMessage", { senderId, message });
    } catch (error) {
      socket.emit("error", { message: "Something went wrong" });
    }
  };
};

export const getChat = (socket, io) => {
  return async (data) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "User not authenticated" });
      }

      const { receiverId } = data;
      const senderId = socket.user._id;

      if (!receiverId) {
        return socket.emit("error", { message: "Receiver ID is required" });
      }

      const chat = await DBservices.findOne({
        model: chatModel,
        data: { senderId, receiverId },
        populate: [
          { path: "senderId", select: "firstName lastName profilePic -_id" },
          { path: "receiverId", select: "firstName lastName profilePic -_id" },
        ],
      });

      if (!chat) {
        return socket.emit("error", { message: "Chat not found" });
      }

      socket.emit("chat", { success: true, chat });
    } catch (error) {
      socket.emit("error", { message: "Something went wrong" });
    }
  };
};
