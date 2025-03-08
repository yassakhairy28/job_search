import * as DBservices from "../../DB/DBservices.js";
import applicationModel from "../../DB/models/application.model.js";
import companyModel from "../../DB/models/company.model.js";
import jobModel from "../../DB/models/job.model.js";
import { fileUpload } from "../../utils/fiile uploading/fileUploading.js";
import { applicationStatus } from "../../DB/valuesEnums.js";
import { io } from "../Socket.io/index.js";

export const addApplication = async (req, res, next) => {
  const application = await DBservices.create({
    model: applicationModel,
    data: {
      userId: req.user._id,
      jobId: req.params.jobId,
    },
  });

  if (application) {
    const { secure_url, public_id } = await fileUpload(req.file, {
      folder: `job-search/jobs/${application.jobId}/applications/${application._id}`,
    });

    await DBservices.updateOne({
      model: applicationModel,
      data: { userCV: { secure_url, public_id } },
      filter: { _id: application._id },
      options: { new: true },
    });
  }

  io.to("HRs").emit("newApplication", {
    message: "New application has been submitted",
    jobId: application.jobId,
    applicantId: application.userId,
  });

  return res
    .status(201)
    .json({ message: "Application added successfully", application });
};

export const allApplications = async (req, res, next) => {
  const { jobId, companyName } = req.params;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName, deletedAt: null },
  });

  if (!company) return next(new Error("company not found", { cause: 404 }));

  const job = await DBservices.findOne({
    model: jobModel,
    data: { _id: jobId, deletedAt: null },
  });

  if (!job) return next(new Error("job not found", { cause: 404 }));

  if (
    String(req.user._id) === String(company.createdBy) ||
    company.HRs.includes(req.user._id)
  ) {
    const applications = await applicationModel
      .find({ jobId })
      .populate([
        {
          path: "userId",
          select: "firstName lastName DOB gender email profilePic  -_id",
        },
      ])
      .paginate(req.query.page);

    if (applications.length === 0)
      return next(new Error("No applications found", { cause: 404 }));

    return res.status(200).json({ success: true, applications });
  }
};

export const applicationForStatus = async (req, res, next) => {
  const { applicationId, jobId, companyName } = req.params;
  const { status } = req.body;
  const user = req.user;
  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName, deletedAt: null },
  });

  if (!company) return next(new Error("company not Found", { cause: 404 }));

  if (!company.HRs.includes(user._id)) {
    return next(new Error("You can't view this application", { cause: 403 }));
  }

  const job = await DBservices.findOne({
    model: jobModel,
    data: { _id: jobId, deletedAt: null },
  });

  if (!job) return next(new Error("job not Found", { cause: 404 }));

  const application = await DBservices.findOne({
    model: applicationModel,
    data: {
      _id: applicationId,
      deletedAt: null,
    },
  });

  if (!application)
    return next(new Error("Application Not Found", { cause: 404 }));

  if (applicationStatus.Rejected === status) {
    application.status = applicationStatus.Rejected;
    await application.save();
  } else if (applicationStatus.Accepted === status) {
    application.status = applicationStatus.Accepted;
    if (job.jobTitle === "HR") company.HRs.push(application.userId);
    await application.save();
    await company.save();
  }

  // emailEmitter.emit("emailForApplication", user.email, user.firstName, status);
  return res.status(200).json({ success: true, message: "Done" });
};
