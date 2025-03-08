import multer, { memoryStorage } from "multer";
import { fileTypeFromBuffer } from "file-type";
import cloudinary from "./cloudinary.config.js";

export const filesValidation = {
  image: ["image/png", "image/jpeg", "image/jpg"],
  pdf: ["application/pdf"],
};

export const upload = multer({
  storage: memoryStorage(),
});

export const filesFilter = (filesTypes) => async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new Error("No file uploaded"));

  const buffer = file.buffer;
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !filesTypes.includes(fileType.mime)) {
    return next(new Error("Invalid file type"));
  }
  return next();
};

export const fileUpload = async (file, { folder }) => {
  const { secure_url, public_id } = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });

  return { secure_url, public_id };
};

export const fileDelete = async (public_id) => {
  await cloudinary.uploader.destroy(public_id);
};
