import * as DBservices from "../../DB/DBservices.js";
import companyModel from "../../DB/models/company.model.js";
import jobModel from "../../DB/models/job.model.js";

export const addJob = async (req, res, next) => {
  const { companyName } = req.params;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName, deletedAt: null },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (company.approvedByAdmin === false)
    return next(new Error("Company not approved by Admin", { cause: 404 }));

  // check if user is the owner or HR
  if (
    String(company.createdBy) === String(req.user._id) ||
    company.HRs.includes(req.user._id)
  ) {
    const userExist = await DBservices.findOne({
      model: jobModel,
      data: { userId: req.user._id },
    });

    const job = await DBservices.create({
      model: jobModel,
      data: { ...req.body, addedBy: req.user._id, companyId: company._id },
    });

    return res
      .status(201)
      .json({ success: true, message: "Job added successfully", job });
  } else {
    return next(new Error("You can't add job", { cause: 403 }));
  }
};

export const searchJob = async (req, res, next) => {
  const { name } = req.query;
  const result = await jobModel
    .find({
      $or: [
        { title: { $regex: name, $options: "i" } },
        { description: { $regex: name, $options: "i" } },
      ],
      deletedAt: null,
    })
    .paginate(req.query.page);

  if (!result) return next(new Error("No job found", { cause: 404 }));

  return res.status(200).json({ success: true, result });
};

export const updateJob = async (req, res, next) => {
  const { jobId } = req.params;

  const job = await DBservices.findOne({
    model: jobModel,
    data: { _id: jobId },
  });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  if (String(job.addedBy) === String(req.user._id)) {
    await DBservices.updateOne({
      model: jobModel,
      filter: { _id: jobId },
      data: { ...req.body },
    });
    return res
      .status(200)
      .json({ success: true, message: "Job updated successfully" });
  } else {
    return next(new Error("You can't update this job", { cause: 403 }));
  }
};

export const deleteJob = async (req, res, next) => {
  const { jobId, companyName } = req.params;

  const job = await DBservices.findOne({
    model: jobModel,
    data: { _id: jobId },
  });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (company.HRs.includes(req.user._id)) {
    await DBservices.deleteOne({
      model: jobModel,
      filter: { _id: jobId },
    });
    return res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } else {
    return next(new Error("You can't delete this job", { cause: 403 }));
  }
};

export const allJobsOrSpecific = async (req, res, next) => {
  if (req.params.jobId) {
    const job = await DBservices.findOne({
      model: jobModel,
      data: { _id: req.params.jobId },
    });
    if (!job) {
      return next(new Error("Job not found", { cause: 404 }));
    }
    return res.status(200).json({ success: true, job });
  }

  const { companyName } = req.params;

  const company = await DBservices.findOne({
    model: companyModel,
    data: { companyName },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  const jobs = await jobModel
    .find({ companyId: company._id })
    .sort({ createdAt: -1 })
    .paginate(req.query.page);
  return res.status(200).json({ success: true, jobs });
};
export const allJobsOrFilteredJobs = async (req, res, next) => {
  let jobs = undefined;
  if (req.query) {
    const {
      jobTitle,
      workingTime,
      jobLocation,
      seniorityLevel,
      technicalSkills,
    } = req.query;

    let filter = {};
    if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");
    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (technicalSkills)
      filter.technicalSkills = { $in: technicalSkills.split(",") };
    jobs = await jobModel
      .find(filter)
      .sort({ createdAt: -1 })
      .paginate(req.query.page);
  } else {
    jobs = await jobModel
      .find()
      .sort({ createdAt: -1 })
      .paginate(req.query.page);
  }
  return res.status(200).json({ success: true, jobs });
};

export const closedJob = async (req, res, next) => {
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
    job.closed = true;
    await job.save();

    return res.status(200).json({ success: true, message: "Job closed" });
  } else {
    return next(new Error("You can't close this job", { cause: 403 }));
  }
};
