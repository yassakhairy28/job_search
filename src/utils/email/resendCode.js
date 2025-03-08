import userModel from "../../DB/models/user.model.js";
import * as DBservices from "../../DB/DBservices.js";
import { emailEmitter } from "./emailEvent.js";

const resendCode = (subject) => {
  return async (req, res, next) => {
    const { email } = req.body;

    const user = await DBservices.findOne({
      model: userModel,
      data: { email },
    });
    if (!user) return next(new Error("User not found", { cause: 404 }));

    const otpData = user.OTP.find((otp) => otp.type === subject);
    if (!otpData) return next(new Error("OTP data not found", { cause: 400 }));

    if (otpData.waitingTime && otpData.waitingTime > Date.now()) {
      const remainingTime = Math.ceil(
        (otpData.waitingTime - Date.now()) / 60000
      );
      return next(
        new Error(`Please wait for ${remainingTime} minutes and try again`, {
          cause: 429,
        })
      );
    }

    otpData.countOfSentCode++;

    switch (otpData.countOfSentCode) {
      case 3:
        otpData.waitingTime = Date.now() + 1 * 60 * 1000;
        otpData.lastSentCount = 1;
        otpData.countOfSentCode = 0;
        break;
      case 5:
        otpData.waitingTime = Date.now() + 3 * 60 * 1000;
        otpData.lastSentCount = 3;
        otpData.countOfSentCode = 0;
        break;
      case 7:
        otpData.waitingTime = Date.now() + 5 * 60 * 1000;
        otpData.lastSentCount = 5;
        otpData.countOfSentCode = 0;
        break;
      case 9:
        otpData.waitingTime = Date.now() + 60 * 60 * 1000;
        otpData.lastSentCount = 7;
        otpData.countOfSentCode = 0;
        break;
      default:
        break;
    }

    emailEmitter.emit("sendEmail", user.email, user.fullName, subject);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Code Sent Successfully" });
  };
};

export default resendCode;
