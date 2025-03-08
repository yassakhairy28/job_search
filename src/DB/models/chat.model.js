import mongoose, { Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new Schema({
  senderId: {
    type: Types.ObjectId,
    required: true,
    ref: "user",
  },
  receiverId: {
    type: Types.ObjectId,
    ref: "user",
    required: true,
  },
  companyName: {
    type: String,
    ref: "company",
    required: true,
  },

  messages: [messageSchema],
});

chatSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

chatSchema.pre("save", async function (next) {
  const company = await mongoose.models.company.findOne({
    companyName: this.companyName,
    $or: [{ HRs: { $in: [this.senderId] } }, { createdBy: this.senderId }],
    deletedAt: null,
  });

  if (!company) {
    return next(new Error("Only HR or Owner can start a chat"));
  }

  next();
});

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;
