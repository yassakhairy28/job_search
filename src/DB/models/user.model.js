import mongoose, { Schema, Types } from "mongoose";
import * as valuesEnums from "../valuesEnums.js";
import { hash } from "../../utils/hashing/hash.js";
import { decrypt, encrypt } from "./../../utils/encryption/encryption.js";
import * as DBservices from "../DBservices.js";
import companyModel from "./company.model.js";
import jobModel from "./job.model.js";

export const defaultProfilePic =
  "https://res.cloudinary.com/dfomwahqk/image/upload/v1740967307/default-profile-account-unknown-icon-black-silhouette-free-vector_dbvlta.jpg";

export const defaultPublicIdOnCloud =
  "1740967307/default-profile-account-unknown-icon-black-silhouette-free-vector_dbvlta";
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, "Frist Name must be at least 3 characters"],
      maxLength: [30, "Frist Name must be at most 30 characters"],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, "Last Name must be at least 3 characters"],
      maxLength: [30, "Last Name must be at most 30 characters"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,5}$/,
    },
    profilePic: {
      secure_url: {
        type: String,
        default: defaultProfilePic,
      },
      public_id: {
        type: String,
        default: defaultPublicIdOnCloud,
      },
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    DOB: {
      type: Date,
      match:
        /(19[0-9]{2}|200[0-5])[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12][0-9]|3[01])$/,
      message: "Date of Birth must be in the format YYYY-MM-DD",
      validate: [
        {
          validator: (value) => value < new Date(),
          message: "Date of Birth must be in the past",
        },
        {
          validator: (value) => {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 18);
            return value <= minDate;
          },
          message: "You must be at least 18 years old to register",
        },
      ],
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(valuesEnums.roles),
      default: valuesEnums.roles.User,
    },
    provider: {
      type: String,
      enum: Object.values(valuesEnums.provider),
      default: valuesEnums.provider.System,
    },
    gender: {
      type: String,
      enum: Object.values(valuesEnums.gender),
    },
    mobileNumber: {
      type: String,
      match: /^(\+2?01|01|00201)[0-2,5]{1}[0-9]{8}$/,
      message: "in-valid mobile number",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    changeCredentialTime: Date,
    OTP: [
      {
        code: String,
        type: {
          type: String,
          enum: Object.values(valuesEnums.otpType), // types of otps
        },
        expiresIn: Date,
        countOfSentCode: {
          type: Number,
          default: 0,
        },
        waitingTime: {
          type: Date,
          default: null,
        },
        lastSentCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    viewers: [
      {
        userId: {
          type: Types.ObjectId,
          ref: "user",
        },
        countOfViews: {
          type: Number,
          default: 0,
        },
        lastViewedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function () {
  return this.firstName && this.lastName
    ? `${this.firstName} ${this.lastName}`
    : "Unknown";
});

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hash({ plainText: this.password });
  }

  if (this.isModified("mobileNumber")) {
    this.mobileNumber = encrypt({
      payload: this.mobileNumber,
      signature: process.env.SECRET_KEY_MOBILENUMBER,
    });
  }

  return next();
});

userSchema.post(
  /^(updateOne|save|findOneAndUpdate|updateMany)/,
  async function (next) {
    const user = this;

    if (user.deletedAt !== null) {
      const company = await DBservices.find({
        model: companyModel,
        data: { createdBy: user._id },
      });

      for (const c of company) {
        c.deletedAt = Date.now();
        await c.save();

        const jobs = await DBservices.find({
          model: jobModel,
          data: { companyId: c._id },
        });
        for (const j of jobs) {
          j.deletedAt = Date.now();
          await j.save();
        }
      }
    } else if (user.deletedAt === null) {
      const company = await DBservices.find({
        model: companyModel,
        data: { createdBy: user._id },
      });

      for (const c of company) {
        c.deletedAt = null;
        await c.save();

        const jobs = await DBservices.find({
          model: jobModel,
          data: { companyId: c._id },
        });
        for (const j of jobs) {
          j.deletedAt = null;
          await j.save();
        }
      }
    }
  }
);

userSchema.post(/^(findOne|findById)/, function (doc, next) {
  if (!doc) return next();
  const user = doc;
  if (user.mobileNumber) {
    user.mobileNumber = decrypt({
      payload: doc.mobileNumber,
      signature: process.env.SECRET_KEY_MOBILENUMBER,
    });
  }
  return next();
});
userSchema.post("find", function (docs, next) {
  docs.forEach((doc) => {
    if (doc.mobileNumber) {
      doc.mobileNumber = decrypt({
        payload: doc.mobileNumber,
        signature: process.env.SECRET_KEY_MOBILENUMBER,
      });
    }
  });

  next();
});

userSchema.query.paginate = async function (page) {
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

userSchema.virtual("application", {
  ref: "application",
  localField: "_id",
  foreignField: "userId",
});
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
