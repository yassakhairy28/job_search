import { Router } from "express";
import * as jobService from "./job.service.js";
import * as validateSchema from "./job.validation.js";
import asyncHandler from "./../../utils/error handling/asyncHandler.js";
import { validate } from "./../../middlewares/validation.js";
import { auth } from "./../../middlewares/auth.middleware.js";
import { allowTo } from "./../../middlewares/auth.middleware.js";
import applicationRouter from "../Application/application.controller.js";

const jobRouter = Router({ mergeParams: true });

jobRouter.use("/:jobId/application", applicationRouter);

jobRouter.post(
  "/add-job",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.addJobSchema),
  asyncHandler(jobService.addJob)
);

jobRouter.get(
  "/search",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.searchJobSchema),
  asyncHandler(jobService.searchJob)
);

jobRouter.post(
  "/update-job/:jobId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.updateJobSchema),
  asyncHandler(jobService.updateJob)
);
jobRouter.delete(
  "/delete-job/:jobId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.specificJobSchema),
  asyncHandler(jobService.deleteJob)
);

jobRouter.get(
  "/all",
  auth,
  allowTo(["Admin", "User"]),
  asyncHandler(jobService.allJobsOrFilteredJobs)
);

jobRouter.get(
  "/:jobId?",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.allJobsOrSpecificSchema),
  asyncHandler(jobService.allJobsOrSpecific)
);
jobRouter.get(
  "/closed-job/:jobId",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.specificJobSchema),
  asyncHandler(jobService.closedJob)
);
export default jobRouter;
