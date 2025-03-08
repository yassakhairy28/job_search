import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addApplicationSchema = joi
  .object({
    jobId: generalFields.id.required(),
    file: generalFields.fileObject.required(),
  })
  .required();

export const allApplicatiosSchema = joi
  .object({
    jobId: generalFields.id.required(),
    companyName: generalFields.name.required(),
    page: generalFields.page,
  })
  .required();

export const applicationStatusSchema = joi
  .object({
    applicationId: generalFields.id.required(),
    companyName: generalFields.name.required(),
    jobId: generalFields.id.required(),
    status: generalFields.applicaionStatus,
  })
  .required();
