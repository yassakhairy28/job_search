import { roles } from "../DB/valuesEnums.js";
import { generateToken, verifyToken } from "../utils/token/token.js";
import * as DBservices from "../DB/DBservices.js";
import userModel from "../DB/models/user.model.js";
import asyncHandler from "../utils/error handling/asyncHandler.js";

export const tokenTypes = {
  Access: "access",
  Refresh: "refresh",
};

export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.Access,
  next = {},
}) => {
  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token) return next(new Error("unauthorized", { cause: 401 }));

  let ACCESS_SIGNATURE = undefined;
  let REFRESH_SIGNATURE = undefined;

  switch (bearer) {
    case "User":
      ACCESS_SIGNATURE = process.env.ACCESS_TOKEN_USER;
      REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_USER;
      break;
    case "Admin":
      ACCESS_SIGNATURE = process.env.ACCESS_TOKEN_ADMIN;
      REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_ADMIN;
      break;
    default:
      break;
  }

  const decoded = verifyToken({
    token,
    signature:
      tokenType === tokenTypes.Access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE,
  });

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: decoded.id },
  });

  if (!user) return next(new Error("user not found", { cause: 404 }));

  if (user.role !== bearer)
    return next(new Error("unauthorized", { cause: 401 }));

  if (user.deletedAt !== null)
    return next(new Error("Please ReActivate Your Account", { cause: 401 }));

  if (user.changeCredentialTime?.getTime() >= decoded.exp * 1000)
    return next(new Error("please login again", { cause: 401 }));
  return user;
};

export const auth = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  req.user = await decodedToken({ authorization, next });

  return next();
});

export const generateAccessToken = (user) => {
  return generateToken({
    payload: {
      id: user._id,
    },
    signature:
      user.role === roles.Admin
        ? process.env.ACCESS_TOKEN_ADMIN
        : process.env.ACCESS_TOKEN_USER,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME },
  });
};

export const generateRefreshToken = (user) => {
  return generateToken({
    payload: {
      id: user._id,
    },
    signature:
      user.role === roles.Admin
        ? process.env.REFRESH_TOKEN_ADMIN
        : process.env.REFRESH_TOKEN_USER,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME },
  });
};

export const allowTo = (roles = []) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new Error("Unauthorized", { cause: 403 }));
    return next();
  };
};
