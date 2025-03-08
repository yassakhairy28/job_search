import { Router } from "express";
import * as authService from "./auth.service.js";
import * as validateSchema from "./auth.validation.js";
import asyncHandler from "./../../utils/error handling/asyncHandler.js";
import { validate } from "./../../middlewares/validation.js";
import resendCode from "./../../utils/email/resendCode.js";
import { otpType } from "../../DB/valuesEnums.js";

const authRouter = Router();

authRouter.post(
  "/sign-up",
  validate(validateSchema.signUpSchema),
  asyncHandler(authService.signUp)
);

authRouter.post(
  "/confirm-email",
  validate(validateSchema.confirmOTPSchema),
  asyncHandler(authService.confirmEmail)
);

authRouter.post(
  "/resend-code-register",
  validate(validateSchema.ResendCodeSchema),
  asyncHandler(resendCode(otpType.register))
);

authRouter.post(
  "/sign-in",
  validate(validateSchema.signInSchema),
  asyncHandler(authService.signIn)
);

authRouter.post(
  "/resend-code-login",
  validate(validateSchema.ResendCodeSchema),
  asyncHandler(resendCode(otpType.login))
);

authRouter.post(
  "/login-otp",
  validate(validateSchema.confirmOTPSchema),
  asyncHandler(authService.loginOtp)
);

// sign up with google
authRouter.post("/signUpWithGmail", asyncHandler(authService.loginWithGmail));
// sign in with google
authRouter.post("/signInWithGmail", asyncHandler(authService.loginWithGmail));

authRouter.post(
  "/forget-password",
  validate(validateSchema.forgetPasswordSchema),
  asyncHandler(authService.forgetPassword)
);

authRouter.post(
  "/resend-code-forget-password",
  validate(validateSchema.ResendCodeSchema),
  asyncHandler(resendCode(otpType.forgetPassword))
);

authRouter.post(
  "/reset-password",
  validate(validateSchema.resetPasswordSchema),
  asyncHandler(authService.resetPassword)
);

authRouter.get("/refresh-token", asyncHandler(authService.refreshToken));

authRouter.get("/logout", asyncHandler(authService.logout));
export default authRouter;
