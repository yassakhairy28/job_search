import { Router } from "express";
import * as userService from "./user.service.js";
import * as validateSchema from "./user.validation.js";
import asyncHandler from "./../../utils/error handling/asyncHandler.js";
import { validate } from "./../../middlewares/validation.js";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import {
  filesFilter,
  filesValidation,
  upload,
} from "../../utils/fiile uploading/fileUploading.js";
const userRouter = Router();

userRouter.post(
  "/update-user/:userId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.updateUserSchema),
  asyncHandler(userService.updateUser)
);

userRouter.get(
  "/profile/:userId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.getUserSchema),
  asyncHandler(userService.getProfile)
);

userRouter.get(
  "/search",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.searchUserSchema),
  asyncHandler(userService.searchUser)
);

userRouter.get(
  "/:userId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.getUserSchema),
  asyncHandler(userService.getSingleUser)
);

userRouter.post(
  "/update-password",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.updatePasswordSchema),
  asyncHandler(userService.updatePassword)
);

userRouter.post(
  "/uploadProfilePic",
  auth,
  allowTo(["Admin", "User"]),
  upload.single("profilePic"),
  filesFilter(filesValidation.image),
  asyncHandler(userService.uploadProfilePic)
);

userRouter.post(
  "/uploadCoverPic",
  auth,
  allowTo(["Admin", "User"]),
  upload.single("coverPic"),
  filesFilter(filesValidation.image),
  asyncHandler(userService.uploadCoverPic)
);

userRouter.delete(
  "/deleteProfilePic",
  auth,
  allowTo(["Admin", "User"]),
  asyncHandler(userService.deleteProfilePic)
);

userRouter.delete(
  "/deleteCoverPic",
  auth,
  allowTo(["Admin", "User"]),
  asyncHandler(userService.deleteCoverPic)
);

userRouter.delete(
  "/deleteUser/:userId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.getUserSchema),
  asyncHandler(userService.deleteUser)
);
export default userRouter;
