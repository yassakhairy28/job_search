import userModel, {
  defaultProfilePic,
  defaultPublicIdOnCloud,
} from "../../DB/models/user.model.js";
import * as DBservices from "../../DB/DBservices.js";
import { compare } from "../../utils/hashing/hash.js";
import {
  fileDelete,
  fileUpload,
} from "../../utils/fiile uploading/fileUploading.js";

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;

  if (req.body.DOB) {
    // convert DOB to date
    req.body.DOB = new Date(req.body.DOB);
    req.body.DOB = new Date(req.body.DOB.getTime() + 86400 * 1000);
  }

  const user = await DBservices.findOneAndUpdate(
    {
      model: userModel,
      filter: { _id: userId, deletedAt: null },
      data: { ...req.body },
    },
    { new: true }
  );

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  user.mobileNumber = req.body.mobileNumber;

  await user.save();
  return res.status(200).json({ message: "User updated successfully", user });
};

export const getProfile = async (req, res, next) => {
  const { userId } = req.params;

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: userId, deletedAt: null },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  return res.status(200).json({ user });
};

export const getSingleUser = async (req, res, next) => {
  const { userId } = req.params;

  if (userId === String(req.user._id)) {
    return res.status(200).json({ user: req.user });
  }

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: userId, deletedAt: null },
    select: "firstName lastName mobileNumber profilePic coverPic viewers",
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  const viewer = user.viewers.findIndex((viewer) => {
    return String(viewer.userId) === String(req.user._id);
  });

  if (viewer === -1) {
    user.viewers.push({
      userId: req.user._id,
      countOfViews: 1,
      lastViewedAt: Date.now(),
    });
  } else {
    user.viewers[viewer].countOfViews += 1;
    user.viewers[viewer].lastViewedAt = Date.now();
  }

  await user.save();

  return res.status(200).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
      viewers: user.viewers.length,
    },
  });
};

export const updatePassword = async (req, res, next) => {
  const user = req.user;

  const checkPassword = compare({
    plainText: req.body.oldPassword,
    hash: user.password,
  });

  // check if password is correct
  if (!checkPassword)
    return next(new Error("in-valid Password", { cause: 400 }));

  user.password = req.body.password;
  await user.save();
  return res.status(200).json({ message: "Password updated successfully" });
};

export const uploadProfilePic = async (req, res, next) => {
  const user = req.user;

  //delete old profile pic
  if (user.profilePic.public_id) {
    await fileDelete(user.profilePic.public_id);
  }

  // upload new profile pic
  const { secure_url, public_id } = await fileUpload(req.file, {
    folder: `job-search/users/${req.user._id}/profilePicture`,
  });

  user.profilePic = { secure_url, public_id };
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Profile picture uploaded" });
};
export const uploadCoverPic = async (req, res, next) => {
  const user = req.user;

  if (user.coverPic.public_id) {
    await fileDelete(user.coverPic.public_id);
  }
  const { secure_url, public_id } = await fileUpload(req.file, {
    folder: `job-search/users/${user._id}/coverPicture`,
  });

  user.coverPic = { secure_url, public_id };
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Cover picture uploaded" });
};

export const searchUser = async (req, res, next) => {
  const { name } = req.query;

  const result = await userModel
    .find({
      $or: [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ],
      deletedAt: null
    })
    .select("firstName lastName mobileNumber profilePic coverPic")
    .paginate(req.query.page);

  if (!result) return next(new Error("No user found", { cause: 404 }));

  return res.status(200).json({ success: true, result });
};

export const deleteProfilePic = async (req, res, next) => {
  const user = req.user;

  if (user.profilePic.public_id) {
    await fileDelete(user.profilePic.public_id);
  }

  user.profilePic.secure_url = defaultProfilePic;
  user.profilePic.public_id = defaultPublicIdOnCloud;

  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Profile picture deleted" });
};

export const deleteCoverPic = async (req, res, next) => {
  const user = req.user;

  if (user.coverPic.public_id) {
    await fileDelete(user.coverPic.public_id);
  }

  user.coverPic.secure_url = null;
  user.coverPic.public_id = null;

  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Profile picture deleted" });
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  const user = await DBservices.findOne({
    model: userModel,
    data: { _id: userId, deletedAt: null },
  });

  // check if user exists
  if (!user) return next(new Error("User not found", { cause: 404 }));

  user.deletedAt = Date.now();
  await user.save();
  return res.status(200).json({ message: "User deleted successfully" });
};
