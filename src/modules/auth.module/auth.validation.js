import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";
export const signUpSchema = joi
  .object({
    firstName: generalFields.name.required(),
    lastName: generalFields.name.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),
    mobileNumber: generalFields.mobileNumber.required(),
    gender: generalFields.gender.required(),
    role: generalFields.role,
    DOB: generalFields.DOB.required(),
  })
  .required();

export const confirmOTPSchema = joi
  .object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  })
  .required();
export const ResendCodeSchema = joi.object({
  email: generalFields.email.required(),
});

export const signInSchema = joi
  .object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();

export const forgetPasswordSchema = joi
  .object({
    email: generalFields.email.required(),
  })
  .required();

export const resetPasswordSchema = joi
  .object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),
  })
  .required();
