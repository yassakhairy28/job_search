import { Router } from "express";
import * as chatService from "./chat.service.js";
import * as validateSchema from "./chat.validation.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { validate } from "../../middlewares/validation.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowTo } from "../../middlewares/auth.middleware.js";

const chatRouter = Router();

chatRouter.get(
  "/:receiverId",
  auth,
  allowTo(["User", "Admin"]),
  validate(validateSchema.getChatSchema),
  asyncHandler(chatService.getChat)
);
chatRouter.post(
  "/message/:receiverId",
  auth,
  allowTo(["User", "Admin"]),
  validate(validateSchema.sendMessageSchema),
  asyncHandler(chatService.sendMessage)
);

export default chatRouter;
