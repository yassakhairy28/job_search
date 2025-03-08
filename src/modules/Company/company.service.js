import * as DBservices from "../../DB/DBservices.js";
import companyModel from "../../DB/models/company.model.js";
import jobModel from "../../DB/models/job.model.js";
import { roles } from "../../DB/valuesEnums.js";
import {
  fileDelete,
  fileUpload,
} from "../../utils/fiile uploading/fileUploading.js";

export const addCompany = async (req, res, next) => {
  // check if company already exist
  const companyIsExist = await DBservices.findOne({
    model: companyModel,
    data: {
      companyName: req.body.companyName,
      companyEmail: req.body.companyEmail,
    },
  });
  if (companyIsExist) {
    return next(new Error("Company already exist", { cause: 400 }));
  }

  const { secure_url, public_id } = await fileUpload(req.file, {
    folder: `job-search/companies/${req.body.companyName}/legalAttachment`,
  });
  const company = await DBservices.create({
    model: companyModel,
    data: {
      ...req.body,
      legalAttachment: { secure_url, public_id },
      createdBy: req.user._id,
    },
  });
  return res
    .status(201)
    .json({ message: "Company added successfully", company });
};

export const updateCompany = async (req, res, next) => {
  const { name } = req.query;

  // check if legal attachment is uploaded
  if (req.file) {
    return next(new Error("You can't update legal attachment", { cause: 400 }));
  }

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName: name, deletedAt: null },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  // check if user is the owner
  if (String(company.createdBy) !== String(req.user._id)) {
    return next(new Error("You can't update this company", { cause: 403 }));
  }
  await DBservices.updateOne({
    model: companyModel,
    data: { ...req.body },
    filter: { companyName: name },
    options: { new: true },
  });

  return res
    .status(200)
    .json({ success: true, message: "Company updated successfully" });
};

export const searchCopmanies = async (req, res, next) => {
  const { name } = req.query;
  const result = await companyModel
    .find({
      companyName: name,
      deletedAt: null,
      $or: [{ "jobs.title": { $regex: name, $options: "i" } }],
    })
    .select("companyName description address logo")
    .papulate(req.query.page);

  if (!result) return next(new Error("No company found", { cause: 404 }));

  return res.status(200).json({ success: true, result });
};

export const deleteCompany = async (req, res, next) => {
  const { name } = req.query;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName: name },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  // check if user is the owner
  if (
    String(company.createdBy) === String(req.user._id) ||
    req.user.role === roles.Admin
  ) {
    company.deletedAt = Date.now();
    // company.deletedAt = null;
    await company.save();
    return res
      .status(200)
      .json({ success: true, message: "Company deleted successfully" });
  } else {
    return next(new Error("You can't delete this company", { cause: 403 }));
  }
};

export const searchCompany = async (req, res, next) => {
  const { name } = req.query;
  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName: name, deletedAt: null },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  return res.status(200).json({ company });
};

export const getCompany = async (req, res, next) => {
  const { name } = req.query;
  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName: name, deletedAt: null },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  const jobs = await DBservices.find({
    model: jobModel,
    data: { companyId: company._id, deletedAt: null },
  });

  return res.status(200).json({ company, jobs });
};

export const uploadLogo = async (req, res, next) => {
  const user = req.user;
  const { name } = req.query;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { createdBy: user._id, companyName: name, deletedAt: null },
  });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  //delete old profile pic
  if (company.Logo.public_id) {
    await fileDelete(company.Logo.public_id);
  }

  // upload new profile pic
  const { secure_url, public_id } = await fileUpload(req.file, {
    folder: `job-search/companies/${company.companyName}/logo`,
  });

  await DBservices.updateOne({
    model: companyModel,
    data: { Logo: { secure_url, public_id } },
    filter: { companyName: name },
  });
  return res
    .status(200)
    .json({ success: true, message: "logo picture uploaded" });
};
export const uploadCoverPic = async (req, res, next) => {
  const user = req.user;
  const { name } = req.query;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { createdBy: user._id, companyName: name, deletedAt: null },
  });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  if (company.coverPic.public_id) {
    await fileDelete(company.coverPic.public_id);
  }
  const { secure_url, public_id } = await fileUpload(req.file, {
    folder: `job-search/companies/${company.companyName}/coverPicture`,
  });

  await DBservices.updateOne({
    model: companyModel,
    data: { coverPic: { secure_url, public_id } },
    filter: { companyName: name },
  });
  return res
    .status(200)
    .json({ success: true, message: "Cover picture uploaded" });
};

export const deleteLogo = async (req, res, next) => {
  const user = req.user;
  const { name } = req.query;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { createdBy: user._id, companyName: name, deletedAt: null },
  });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  await fileDelete(company.Logo.public_id);

  await DBservices.updateOne({
    model: companyModel,
    data: { Logo: { secure_url: null, public_id: null } },
    filter: { companyName: name },
  });
  return res
    .status(200)
    .json({ success: true, message: "logo picture deleted" });
};

export const deleteCoverPic = async (req, res, next) => {
  const user = req.user;
  const { name } = req.query;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { createdBy: user._id, companyName: name, deletedAt: null },
  });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  await fileDelete(company.coverPic.public_id);

  await DBservices.updateOne({
    model: companyModel,
    data: { coverPic: { secure_url: null, public_id: null } },
    filter: { companyName: name },
  });
  return res
    .status(200)
    .json({ success: true, message: "Profile picture deleted" });
};
