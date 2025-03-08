import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const getChatSchema = joi
  .object({
    receiverId: generalFields.id.required(),
  })
  .required();
export const sendMessageSchema = joi
  .object({
    receiverId: generalFields.id.required(),
    companyName: generalFields.name.required(),
    message: generalFields.message.required(),
  })
  .required();
