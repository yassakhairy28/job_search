import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const updateUserSchema = joi
  .object({
    userId: generalFields.id.required(),
    firstName: generalFields.name,
    lastName: generalFields.name,
    DOB: generalFields.DOB,
    mobileNumber: generalFields.mobileNumber,
    gender: generalFields.gender,
  })
  .required();

export const getUserSchema = joi
  .object({
    userId: generalFields.id.required(),
  })
  .required();

export const searchUserSchema = joi
  .object({
    name: generalFields.name.required(),
    page: generalFields.page,
  })
  .required();

export const updatePasswordSchema = joi
  .object({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.confirmPassword.required(),
  })
  .required();
