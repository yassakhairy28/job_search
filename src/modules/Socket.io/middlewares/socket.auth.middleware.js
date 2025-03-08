import userModel from "../../../DB/models/user.model.js";
import * as DBservices from "../../../DB/DBservices.js";
import { tokenTypes } from "../../../middlewares/auth.middleware.js";
import { verifyToken } from "../../../utils/token/token.js";

export const socketAuth = async ({
  socket,
  tokenType = tokenTypes.Access,
  next,
}) => {
  if (!socket.handshake || !socket.handshake.auth) {
    return next(new Error("Invalid handshake request"));
  }
  const authorization = socket.handshake?.headers?.authorization;
  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token) throw new Error("unauthorized");

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

  if (!user) throw new Error("user not found");

  if (user.role !== bearer) throw new Error("unauthorized");

  if (user.deletedAt !== null)
    throw new Error("Please ReActivate Your Account", { cause: 401 });

  if (user.changeCredentialTime?.getTime() >= decoded.exp * 1000)
    throw new Error("please login again", { cause: 401 });

  socket.user = user;
  socket.userId = user.id;
  return next();
};
