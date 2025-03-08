import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addCompanySchema = joi
  .object({
    companyName: generalFields.name.required(),
    description: generalFields.description.required(),
    industry: generalFields.industry.required(),
    address: generalFields.address.required(),
    numberOfEmployees: generalFields.numberOfEmployees.required(),
    companyEmail: generalFields.email.required(),
    file: generalFields.fileObject.required(),
  })
  .required();

export const searchCompanySchema = joi
  .object({
    name: generalFields.name.required(),
    page: generalFields.page,
  })
  .required();

export const updateCompanySchema = joi
  .object({
    description: generalFields.description,
    industry: generalFields.industry,
    address: generalFields.address,
    numberOfEmployees: generalFields.numberOfEmployees,
    name: generalFields.name.required(),
  })
  .required();

export const spacificCompany = joi
  .object({
    name: generalFields.name.required(),
  })
  .required();
export const uploadPicSchema = joi
  .object({
    name: generalFields.name.required(),
    file: generalFields.fileObject.required(),
  })
  .required();
