import mongoose, { Schema, Types } from "mongoose";
import { applicationStatus } from "../valuesEnums.js";
const applicationSchema = new Schema(
  {
    jobId: {
      type: Types.ObjectId,
      ref: "job",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    userCV: {
      secure_url: String,
      public_id: String,
    },
    status: {
      type: String,
      enum: Object.values(applicationStatus),
      default: applicationStatus.Pending,
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

applicationSchema.query.paginate = async function (page) {
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

const applicationModel =
  mongoose.models.application ||
  mongoose.model("application", applicationSchema);

export default applicationModel;
