import { EventEmitter } from "events";
import { customAlphabet } from "nanoid";
import { hash } from "./../hashing/hash.js";
import * as DBservices from "../../DB/DBservices.js";
import userModel from "./../../DB/models/user.model.js";
import { templateOTP } from "./templateOTP.js";
import { otpType } from "../../DB/valuesEnums.js";
import { sendEmail } from "./sendEmail.js";
import { templateApplicationStatus } from "./templateApplicationStatus.js";

// message
export const message = {
  register:
    "Thank you for registering with [Job Search App]. To complete your registration, please use the following OTP.",
  login: "To complete your login, please Enter the Code.",
  resetPassword: "To reset your password, please enter the following OTP.",
  loginWithGoogle: "Thank you for using with [Job Search App].",
};

export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async (email, userName, subjectType) => {
  // Generate OTP
  const otp = customAlphabet("0123456789", 5)();
  const hashOtp = hash({ plainText: otp });
  const expiresIn = Date.now() + 10 * 60 * 1000;

  //update otp
  const user = await DBservices.updateOne({
    model: userModel,
    filter: { email, "OTP.type": subjectType },
    data: {
      $set: {
        "OTP.$.code": hashOtp,
        "OTP.$.expiresIn": expiresIn,
      },
    },
  });

  if (!user.modifiedCount) {
    await DBservices.updateOne({
      model: userModel,
      filter: { email },
      data: {
        $push: {
          OTP: {
            code: hashOtp,
            type: subjectType,
            expiresIn,
          },
        },
      },
    });
  }

  // message handling
  let msg;
  switch (subjectType) {
    case otpType.register:
      msg = message.register;
      break;
    case otpType.login:
      msg = message.login;
      break;
    case otpType.forgetPassword:
      msg = message.resetPassword;
      break;
    default:
      msg = "Here is your OTP code:";
  }

  //send email
  await sendEmail({
    to: email,
    subject: subjectType,
    html: templateOTP(otp, userName, subjectType, msg),
  });
});

emailEmitter.on("sendEmailWithGoogle", async (email, fullName) => {
  await sendEmail({
    to: email,
    subject: otpType.loginWithGoogle,
    html: templateOTP(
      "Job Search Application",
      fullName,
      otpType.loginWithGoogle,
      message.loginWithGoogle
    ),
  });
});

emailEmitter.on("emailForApplication", async (email, firstName, status) => {
  await sendEmail({
    to: email,
    subject: "Application Status",
    html: templateApplicationStatus(firstName, status),
  });
});
