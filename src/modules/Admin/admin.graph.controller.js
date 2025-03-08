import * as schemaDefinition from "../../graphql/middlewares/schemaDefinitionGraphQL.js";
import * as adminQueryService from "./admin.query.service.js";
import * as adminMutationService from "./admin.mutation.service.js";
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
export const query = {
  allUsersAndCompanies: {
    type: new GraphQLObjectType({
      name: "allUsersAndCompanies",
      fields: () => ({
        success: { type: GraphQLBoolean },
        statusCode: { type: GraphQLInt },
        data: {
          type: new GraphQLObjectType({
            name: "data",
            fields: () => ({
              users: { type: new GraphQLList(schemaDefinition.userType) },
              companies: {
                type: new GraphQLList(schemaDefinition.companyType),
              },
            }),
          }),
        },
      }),
    }),
    args: {
      authorization: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: adminQueryService.allUsersAndCompanies,
  },
};

export const mutation = {
  banOrUnbanedUser: {
    type: new GraphQLObjectType({
      name: "banOrUnbanedUser",
      fields: () => ({
        statusCode: { type: GraphQLInt },
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
      }),
    }),
    args: {
      userId: { type: new GraphQLNonNull(GraphQLString) },
      // if isBanned = true => ban user
      isBanned: { type: new GraphQLNonNull(GraphQLBoolean) },
      authorization: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: adminMutationService.banOrUnbanedUser,
  },
  banOrUnbanedCompany: {
    type: new GraphQLObjectType({
      name: "banOrUnbanedCompany",
      fields: () => ({
        statusCode: { type: GraphQLInt },
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
      }),
    }),
    args: {
      companyName: { type: new GraphQLNonNull(GraphQLString) },
      // if isBanned = true => ban company
      isBanned: { type: new GraphQLNonNull(GraphQLBoolean) },
      authorization: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: adminMutationService.banOrUnbanedCompany,
  },
  ApproveCompany: {
    type: new GraphQLObjectType({
      name: "ApproveCompany",
      fields: () => ({
        statusCode: { type: GraphQLInt },
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
      }),
    }),
    args: {
      companyName: { type: new GraphQLNonNull(GraphQLString) },
      authorization: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: adminMutationService.ApproveCompany,
  },
};
