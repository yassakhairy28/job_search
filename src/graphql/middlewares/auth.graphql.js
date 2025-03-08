import { roles } from "../../DB/valuesEnums.js";
import * as DBservices from "../../DB/DBservices.js";
import userModel from "../../DB/models/user.model.js";
import { verifyToken } from "../../utils/token/token.js";

const graphqlAuth = async ({ authorization = "" }) => {
  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token || bearer !== roles.Admin)
    throw new Error("unauthorized");

  const decoded = verifyToken({
    token,
    signature: process.env.ACCESS_TOKEN_ADMIN,
  });

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: decoded.id },
  });

  if (!user) throw new Error("user not found");

  if (user.role !== roles.Admin)
    throw new Error("unauthorized", { cause: 401 });

  if (user.deletedAt !== null)
    throw new Error("Please ReActivate your account", { cause: 401 });

  if (user.changeCredentialTime?.getTime() >= decoded.exp * 1000)
    throw new Error("Please Login again", { cause: 401 });
  return true;
};

export default graphqlAuth;
