import mongoose, { Schema, Types, model } from "mongoose";
import jobModel from "./job.model.js";
import * as DBservices from "../DBservices.js";

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      maxLength: [30, "Company Name must be at most 30 characters"],
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      type: Number,
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    Logo: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    HRs: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    bannedAt: Date,
    deletedAt: {
      type: Date,
      default: null,
    },
    legalAttachment: {
      secure_url: String,
      public_id: String,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.query.paginate = async function (page) {
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

companySchema.virtual("job", {
  ref: "job",
  localField: "_id",
  foreignField: "companyId",
});

companySchema.post(
  /^(updateOne|updateMany|findOneAndUpdate|save)$/,
  async function (next) {
    if (this.deletedAt !== null) {
      const jobs = await DBservices.updateMany({
        model: jobModel,
        filter: { companyId: this._id },
        data: { deletedAt: Date.now() },
      });
    } else if (this.deletedAt === null) {
      await DBservices.updateMany({
        model: jobModel,
        filter: { companyId: this._id },
        data: { deletedAt: null },
      });
    }
  }
);

export default mongoose.models.company || model("company", companySchema);
