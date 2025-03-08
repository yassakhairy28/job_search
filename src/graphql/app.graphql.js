import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as adminController from "../modules/Admin/admin.graph.controller.js";
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainQuery",
    fields: {
      ...adminController.query,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "MainMutation",
    fields: {
      ...adminController.mutation,
    },
  }),
});
