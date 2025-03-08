import mongoose, { Schema, Types } from "mongoose";
import { jobLocation, seniorityLevel, workingTime } from "./../valuesEnums.js";
import applicationModel from "./application.model.js";
import * as DBservices from "../DBservices.js";

const jobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      required: true,
      enum: Object.values(jobLocation),
    },
    workingTime: {
      type: String,
      required: true,
      enum: Object.values(workingTime),
    },
    seniorityLevel: {
      type: String,
      required: true,
      enum: Object.values(seniorityLevel),
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: [
      {
        type: String,
        required: true,
      },
    ],
    softSkills: [
      {
        type: String,
        required: true,
      },
    ],
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.query.paginate = async function (page) {
  page = page || 1;
  page = Number(page);

  const limit = 3;

  const skip = limit * (page - 1);

  const data = await this.skip(skip).limit(limit);
  const items = await this.model.countDocuments();
  const totalPages = Math.ceil(items / limit);
  return {
    data,
    totalPages,
    currentPage: page,
    totalItems: items,
    itemsPerPage: data.length,
    nextPage: page + 1 > totalPages ? null : page + 1,
    prevPage: page - 1 < 1 ? null : page - 1,
  };
};

jobSchema.virtual("application", {
  ref: "application",
  localField: "_id",
  foreignField: "jobId",
});

const jobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default jobModel;
