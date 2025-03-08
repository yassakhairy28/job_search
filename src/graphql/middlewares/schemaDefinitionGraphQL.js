import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLScalarType,
  Kind,
  GraphQLList,
  GraphQLInt,
} from "graphql";

// Custom Date scalar
const GraphQLDate = new GraphQLScalarType({
  name: "Date",
  description: "Custom Date scalar type",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value) {
    return value ? new Date(value) : null;
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

const fileType = new GraphQLObjectType({
  name: "File",
  fields: () => ({
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  }),
});

const userInfo = new GraphQLObjectType({
  name: "UserInfo",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    profilePic: { type: fileType },
  }),
});

// User
export const userType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    fullName: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    provider: { type: GraphQLString },
    gender: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    deletedAt: { type: GraphQLDate },
    isConfirmed: { type: GraphQLBoolean },
    coverPic: { type: fileType },
    profilePic: { type: fileType },
    viewers: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "Viewer",
          fields: () => ({
            _id: { type: GraphQLID },
            userId: { type: GraphQLID },
            countOfViews: { type: GraphQLInt },
            lastViewedAt: { type: GraphQLDate },
          }),
        })
      ),
    },
    updatedAt: { type: GraphQLDate },
    createdAt: { type: GraphQLDate },
  }),
});

export const companyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLInt },
    companyEmail: { type: GraphQLString },
    createdBy: { type: userInfo },
    HRs: { type: new GraphQLList(userInfo) },
    legalAttachment: { type: fileType },
    approvedByAdmin: { type: GraphQLBoolean },
    Logo: { type: fileType },
    deletedAt: { type: GraphQLDate },
    updatedAt: { type: GraphQLDate },
    createdAt: { type: GraphQLDate },
  }),
});
