import * as DBservices from "../../DB/DBservices.js";
import chatModel from "../../DB/models/chat.model.js";
import companyModel from "../../DB/models/company.model.js";

export const getChat = async (req, res, next) => {
  const { receiverId } = req.params;

  const chat = await DBservices.findOne({
    model: chatModel,
    data: { senderId: req.user._id, receiverId: receiverId },
    populate: [
      { path: "senderId", select: "firstName lastName profilePic -_id" },
      { path: "receiverId", select: "firstName lastName profilePic -_id" },
    ],
  });

  return res.status(200).json({ success: true, chat });
};

export const sendMessage = async (req, res, next) => {
  const { receiverId } = req.params;
  const { message, companyName } = req.body;

  if (String(receiverId) === String(req.user._id)) {
    return next(new Error("You can't chat with yourself", { cause: 400 }));
  }

  let chat = await DBservices.findOne({
    model: chatModel,
    data: { senderId: req.user._id, receiverId: receiverId },
  });

  if (!chat) {
    const permission = await DBservices.findOne({
      model: companyModel,
      data: {
        companyName,
        $or: [{ HRs: { $in: [req.user._id] } }, { createdBy: req.user._id }],
      },
    });

    if (permission) {
      chat = await DBservices.create({
        model: chatModel,
        data: {
          senderId: req.user._id,
          receiverId: receiverId,
          companyName,
          message: [{ senderId: req.user._id, message }],
        },
      });
    } else {
      return next(
        new Error("Only HR or Owner can start a chat", { cause: 400 })
      );
    }
  } else {
    chat = await DBservices.updateOne({
      model: chatModel,
      data: { $push: { message: { senderId: req.user._id, message } } },
      filter: { senderId: req.user._id, receiverId: receiverId },
    });
  }

  return res.status(200).json({ success: true, chat });
};
