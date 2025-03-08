import { Router } from "express";
import * as companyService from "./company.service.js";
import * as validateSchema from "./company.validation.js";
import asyncHandler from "./../../utils/error handling/asyncHandler.js";
import { validate } from "./../../middlewares/validation.js";
import { allowTo } from "./../../middlewares/auth.middleware.js";
import { auth } from "./../../middlewares/auth.middleware.js";
import {
  filesFilter,
  filesValidation,
  upload,
} from "../../utils/fiile uploading/fileUploading.js";
import jobRouter from "../Job/job.controller.js";

const companyRouter = Router();

companyRouter.use("/:companyName/job", jobRouter);

companyRouter.post(
  "/add-company",
  auth,
  allowTo(["Admin", "User"]),
  upload.single("legalAttachment"),
  filesFilter([...filesValidation.image, ...filesValidation.pdf]),
  validate(validateSchema.addCompanySchema),
  asyncHandler(companyService.addCompany)
);

companyRouter.get(
  "/search",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.searchCompanySchema),
  asyncHandler(companyService.searchCopmanies)
);

companyRouter.post(
  "/update-company",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.updateCompanySchema),
  asyncHandler(companyService.updateCompany)
);

companyRouter.delete(
  "/delete-company",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.spacificCompany),
  asyncHandler(companyService.deleteCompany)
);
companyRouter.get(
  "/get-company",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.spacificCompany),
  asyncHandler(companyService.getCompany)
);

companyRouter.get(
  "/",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.spacificCompany),
  asyncHandler(companyService.searchCompany)
);

companyRouter.post(
  "/upload-logo",
  auth,
  allowTo(["Admin", "User"]),
  upload.single("logo"),
  filesFilter(filesValidation.image),
  validate(validateSchema.uploadPicSchema),
  asyncHandler(companyService.uploadLogo)
);

companyRouter.delete(
  "/delete-logo",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.spacificCompany),
  asyncHandler(companyService.deleteLogo)
);

companyRouter.post(
  "/upload-coverPic",
  auth,
  allowTo(["Admin", "User"]),
  upload.single("coverPic"),
  filesFilter(filesValidation.image),
  validate(validateSchema.uploadPicSchema),
  asyncHandler(companyService.uploadCoverPic)
);

companyRouter.delete(
  "/delete-coverPic",
  auth,
  allowTo(["Admin", "User"]),
  validate(validateSchema.spacificCompany),
  asyncHandler(companyService.deleteCoverPic)
);
export default companyRouter;
