import userModel from "./../../DB/models/user.model.js";
import * as DBservices from "../../DB/DBservices.js";
import { emailEmitter } from "./../../utils/email/emailEvent.js";
import * as valuesEnums from "../../DB/valuesEnums.js";
import { compare } from "../../utils/hashing/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../middlewares/auth.middleware.js";
import { OAuth2Client } from "google-auth-library";
import { verifyToken } from "../../utils/token/token.js";

export const signUp = async (req, res, next) => {
  // convert DOB to date
  req.body.DOB = new Date(req.body.DOB);
  req.body.DOB = new Date(req.body.DOB.getTime() + 86400 * 1000);
  // check if user already exists
  const checkUser = await DBservices.findOne({
    model: userModel,
    data: { email: req.body.email },
  });
  if (checkUser) return next(new Error("Email already exists", { cause: 400 }));

  // create user
  const user = await DBservices.create({
    model: userModel,
    data: { ...req.body },
  });

  // send email
  emailEmitter.emit(
    "sendEmail",
    user.email,
    user.fullName,
    valuesEnums.otpType.register
  );

  return res.status(201).json({ message: "User created successfully", user });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBservices.findOne({
    model: userModel,
    data: { email },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user.isConfirmed)
    return next(new Error("Email already confirmed", { cause: 400 }));

  // check if otp is valid
  const otpData = user.OTP.find(
    (otp) => otp.type === valuesEnums.otpType.register
  );

  const checkCode = compare({ plainText: otp, hash: otpData.code });

  // check if otp is valid
  if (!checkCode) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  // check if otp is expired
  if (otpData.expiresIn + 10 * 60 * 1000 < Date.now()) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  // update user
  await DBservices.updateOne({
    model: userModel,
    filter: { email },
    data: {
      isConfirmed: true,
      OTP: [],
    },
  });

  return res.status(200).json({ message: "Email confirmed successfully" });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBservices.findOne({
    model: userModel,
    data: { email },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // check if user is confirmed
  if (!user.isConfirmed)
    return next(new Error("Email not confirmed", { cause: 400 }));

  const checkPassword = compare({ plainText: password, hash: user.password });

  // check if password is correct
  if (!checkPassword)
    return next(new Error("in-valid username or Password", { cause: 400 }));

  emailEmitter.emit(
    "sendEmail",
    user.email,
    user.fullName,
    valuesEnums.otpType.login
  );

  return res.status(200).json({
    success: true,
    message: "to complete your login, please Enter the Code.",
  });
};

export const loginOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBservices.findOne({
    model: userModel,
    data: { email },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // check if otp is valid
  const otpData = user.OTP.find(
    (otp) => otp.type === valuesEnums.otpType.login
  );

  const checkCode = compare({ plainText: otp, hash: otpData.code });

  // check if otp is valid
  if (!checkCode) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  // check if otp is expired
  if (otpData.expiresIn + 10 * 60 * 1000 < Date.now()) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  // update user
  await DBservices.updateOne({
    model: userModel,
    filter: { email },
    data: {
      OTP: [],
      changeCredentialTime: Date.now(),
      deletedAt: null,
    },
  });

  if (user.deletedAt !== null) {
    user.deletedAt = null;
    await user.save();
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
  });
};

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { email, name, picture, email_verified } = await verify();
  const [firstName, lastName] = name.split(" ");
  if (!email_verified)
    return next(new Error("please verify your email", { cause: 400 }));

  let user = await DBservices.findOne({ model: userModel, data: { email } });

  if (user?.providers === valuesEnums.provider.System)
    return next(new Error("Email Already Exist", { cause: 409 }));

  if (!user) {
    user = await DBservices.create({
      model: userModel,
      data: {
        email,
        firstName,
        lastName,
        profilePic: picture,
        provider: valuesEnums.provider.Google,
        isConfirmed: true,
      },
    });
  }

  emailEmitter.emit("sendEmailWithGoogle", user.email, user.fullName);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const Tokens = { accessToken, refreshToken };

  return res.status(200).json({ success: true, Tokens });
};
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await DBservices.findOne({
    model: userModel,
    data: { email, deletedAt: null },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  emailEmitter.emit(
    "sendEmail",
    user.email,
    user.fullName,
    valuesEnums.otpType.forgetPassword
  );

  return res.status(200).json({
    success: true,
    message: "to complete your forget password, please Enter the Code.",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await DBservices.findOne({
    model: userModel,
    data: { email },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // check if otp is valid
  const otpData = user.OTP.find(
    (otp) => otp.type === valuesEnums.otpType.forgetPassword
  );

  const checkCode = compare({ plainText: otp, hash: otpData.code });

  // check if otp is valid
  if (!checkCode) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  // check if otp is expired
  if (otpData.expiresIn + 10 * 60 * 1000 < Date.now()) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  user.password = password;
  user.changeCredentialTime = Date.now() + 30 * 60 * 1000;
  user.OTP = [];
  await user.save();
  return res.status(200).json({ success: true, message: "Password updated" });
};

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;

  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token) return next(new Error("unauthorized", { cause: 401 }));

  let REFRESH_SIGNATURE = undefined;

  switch (bearer) {
    case "User":
      REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_USER;
      break;
    case "Admin":
      REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_ADMIN;
      break;
    default:
      break;
  }

  const decoded = verifyToken({
    token,
    signature: REFRESH_SIGNATURE,
  });

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: decoded.id, deletedAt: null },
  });

  if (!user) return next(new Error("user not found", { cause: 404 }));

  if (user.role !== bearer)
    return next(new Error("unauthorized", { cause: 401 }));

  if (user.isDeleted == true)
    return next(new Error("Please ReActivate Your Account", { cause: 401 }));

  if (decoded.exp + 7 * 24 * 60 * 60 * 1000 > Date.now())
    return next(new Error("please login again", { cause: 401 }));

  const accessToken = generateAccessToken(user);

  user.changeCredentialTime = Date.now();
  await user.save();

  return res.status(200).json({ success: true, accessToken });
};

export const logout = async (req, res, next) => {
  req.user.changeCredentialTime = Date.now() + 30 * 60 * 1000;

  await req.user.save();

  return res
    .status(200)
    .json({ success: true, message: "Logout Successfully" });
};
