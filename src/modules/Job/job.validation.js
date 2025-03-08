import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addJobSchema = joi
  .object({
    jobTitle: generalFields.name.required(),
    jobLocation: generalFields.jobLocation.required(),
    workingTime: generalFields.workingTime.required(),
    seniorityLevel: generalFields.seniorityLevel.required(),
    jobDescription: generalFields.description.required(),
    technicalSkills: generalFields.skills.required(),
    softSkills: generalFields.skills.required(),
    companyName: generalFields.name.required(),
  })
  .required();

export const updateJobSchema = joi
  .object({
    jobTitle: generalFields.name,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.description,
    technicalSkills: generalFields.skills,
    softSkills: generalFields.skills,
    jobId: generalFields.id.required(),
  })
  .required();

export const specificJobSchema = joi
  .object({
    jobId: generalFields.id.required(),
    companyName: generalFields.name.required(),
  })
  .required();

export const allJobsOrSpecificSchema = joi
  .object({
    companyName: generalFields.name.required(),
    jobId: generalFields.id,
    page: generalFields.page,
  })
  .required();

export const searchJobSchema = joi
  .object({
    name: generalFields.name.required(),
    page: generalFields.page,
  })
  .required();

export const allJobsOrFilteredSchema = joi.object({
  filter: generalFields.name,
  page: generalFields.page,
});
