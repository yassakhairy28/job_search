import * as DBservices from "../../DB/DBservices.js";
import userModel from "../../DB/models/user.model.js";
import companyModel from "../../DB/models/company.model.js";
import graphqlAuth from "../../graphql/middlewares/auth.graphql.js";

export const allUsersAndCompanies = async (parent, args) => {
  const { authorization } = args;

  const auth = graphqlAuth({ authorization });

  if (!auth) throw new Error("unauthorized", { cause: 401 });
  const users = await DBservices.find({
    model: userModel,
    data: { role: "User" },
  });
  const companies = await DBservices.find({
    model: companyModel,
    populate: [
      {
        path: "createdBy",
        select: "firstName lastName role email mobileNumber profilePic",
      },
      {
        path: "HRs",
        select: "firstName lastName role email mobileNumber profilePic",
      },
    ],
  });

  return { success: true, statusCode: 200, data: { users, companies } };
};
