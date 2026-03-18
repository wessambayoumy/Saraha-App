import multer from "multer";
import { v4 } from "uuid";
import { existsSync, mkdirSync } from "node:fs";
import { Request } from "express";

export const multerMiddleware = ({ customPath = "general" } = {}) => {
  const storage = multer.diskStorage({
    destination(_req, _file, callback) {
      const path = `uploads/${customPath}`;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      callback(null, path);
    },
    filename(_req, file, callback) {
      callback(null, v4() + "_" + file.originalname);
    },
  });
  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
  ) => {
    let allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (customPath.endsWith("attachments"))
      allowedTypes.push(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
        "application/msword",
        "text/plain",
      );
    if (allowedTypes.includes(file.mimetype)) return callback(null, true);

    callback(null, false);
  };
  return multer({ storage, fileFilter });
};
