import { Router } from "express";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.js";
import * as validateSchema from "./application.validation.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import * as application from "./application.service.js";
import {
  filesFilter,
  filesValidation,
  upload,
} from "../../utils/fiile uploading/fileUploading.js";

const applicationRouter = Router({ mergeParams: true });

applicationRouter.post(
  "/addApplication",
  auth,
  allowTo(["User"]),
  upload.single("userCV"),
  filesFilter(filesValidation.pdf),
  validate(validateSchema.addApplicationSchema),
  asyncHandler(application.addApplication)
);
applicationRouter.get(
  // router
  // /company/companyName/job/jobId/application
  "/",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.allApplicatiosSchema),
  asyncHandler(application.allApplications)
);

applicationRouter.post(
  "/status/:applicationId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.applicationStatusSchema),
  asyncHandler(application.applicationForStatus)
);
export default applicationRouter;
