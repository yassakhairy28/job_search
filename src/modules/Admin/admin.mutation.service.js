import userModel from "../../DB/models/user.model.js";
import * as DBservices from "../../DB/DBservices.js";
import companyModel from "../../DB/models/company.model.js";
import graphqlAuth from "../../graphql/middlewares/auth.graphql.js";

export const banOrUnbanedUser = async (parent, args) => {
  const { userId, isBanned, authorization } = args;

  const auth = graphqlAuth({ authorization });

  if (!auth) throw new Error("unauthorized", { cause: 401 });

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: userId },
  });

  if (!user) throw new Error("User not found", { cause: 404 });

  if (isBanned) {
    if (user.bannedAt !== null)
      throw new Error("User already banned", { cause: 400 });
    user.bannedAt = Date.now();
    await user.save();
    return {
      status: 200,
      success: true,
      message: "User banned successfully",
    };
  } else {
    user.bannedAt = null;
    await user.save();
    return {
      statusCode: 200,
      success: true,
      message: "User unbanned successfully",
    };
  }
};
export const banOrUnbanedCompany = async (parent, args) => {
  const { companyName, isBanned, authorization } = args;

  const auth = decodedToken({ authorization });

  if (!auth) throw new Error("unauthorized", { cause: 401 });

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName },
  });

  if (!company) throw new Error("company not found", { cause: 404 });

  if (isBanned) {
    if (company.bannedAt !== null)
      throw new Error("company already banned", { cause: 400 });
    company.bannedAt = Date.now();
    await company.save();
    return {
      status: 200,
      success: true,
      message: "company banned successfully",
    };
  } else {
    company.bannedAt = null;
    await company.save();
    return {
      statusCode: 200,
      success: true,
      message: "company unbanned successfully",
    };
  }
};
export const ApproveCompany = async (parent, args) => {
  const { companyName, authorization } = args;
  const auth = decodedToken({ authorization });

  if (!auth) throw new Error("unauthorized", { cause: 401 });

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName, bannedAt: null, deletedAt: null },
  });

  if (!company) throw new Error("company not found", { cause: 404 });

  if (company.approvedByAdmin)
    throw new Error("company already approved", { cause: 400 });

  company.approvedByAdmin = true;
  await company.save();
  return {
    statusCode: 200,
    success: true,
    message: "company approved successfully",
  };
};
