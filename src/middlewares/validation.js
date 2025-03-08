import joi from "joi";
import * as valuesEnums from "../DB/valuesEnums.js";
import { Types } from "mongoose";
export const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    if (req.file) {
      data.file = req.file;
    }

    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
      const errorMessages = result.error.details.map((err) => err.message);
      return next(new Error(errorMessages, { cause: 400 }));
    }

    next();
  };
};

// general fields of all models
export const generalFields = {
  name: joi.string().min(2).max(30),
  email: joi.string().email(),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    )
    .message(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
  confirmPassword: joi.string().valid(joi.ref("password")).min(6),
  picture: joi.object({
    secure_url: joi.string(),
    public_id: joi.string(),
  }),
  mobileNumber: joi
    .string()
    .pattern(new RegExp(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/))
    .message("in-valid mobile number"),
  role: joi.string().custom((value, helper) => {
    return Object.values(valuesEnums.roles).includes(value)
      ? true
      : helper.message("in-valid role");
  }),
  gender: joi.string().custom((value, helper) => {
    return Object.values(valuesEnums.gender).includes(value)
      ? true
      : helper.message("in-valid gender");
  }),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("in-valid id");
  }),
  fileObject: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    buffer: joi.any().required(),
    size: joi.number().required(),
  }),
  DOB: joi.string().custom((value, helper) => {
    // match format date
    if (!/^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/.test(value))
      return helper.message("Date of Birth must be in the format YYYY-MM-DD");

    const date = new Date(value);
    const today = new Date();

    if (date.getFullYear() < 1990)
      return helper.message("Date of Birth must be later than 1990");

    let age = today.getFullYear() - date.getFullYear();

    if (age < 18) {
      return helper.message("You must be at least 18 years old to register");
    }

    if (date > today) {
      return helper.message("Date of Birth must be in the past");
    }

    return true;
  }),

  otp: joi.string().pattern(/^[0-9]{5}$/),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("in-valid id");
  }),

  description: joi.string().min(10).max(1000),
  industry: joi.string(),
  address: joi.string(),
  numberOfEmployees: joi.number(),
  jobLocation: joi.string().custom((value, helper) => {
    return Object.values(valuesEnums.jobLocation).includes(value)
      ? true
      : helper.message("in-valid jobLocation");
  }),
  workingTime: joi.string().custom((value, helper) => {
    return Object.values(valuesEnums.workingTime).includes(value)
      ? true
      : helper.message("in-valid workingTime");
  }),
  seniorityLevel: joi.string().custom((value, helper) => {
    return Object.values(valuesEnums.seniorityLevel).includes(value)
      ? true
      : helper.message("in-valid seniorityLevel");
  }),
  description: joi.string().min(10).max(1000),
  skills: joi.array().items(joi.string()),

  page: joi.number().min(1),
  applicaionStatus: joi.string().custom((value, helper) => {
    return Object.values(valuesEnums.applicationStatus).includes(value)
      ? true
      : helper.message("in-valid Application status");
  }),
  message: joi.string(),
};
