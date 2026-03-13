import multer from "multer";
import { v4 } from "uuid";
import { existsSync, mkdirSync } from "node:fs";
import { Request } from "express";


export const multerMiddleware = ({ customPath = "general" }) => {
  let storage = multer.diskStorage({
    destination(_req, _file, callback) {
      const path = `uploads/${customPath}`;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      callback(null, path);
    },
    filename(_req, file, callback) {
      callback(null, v4() + "_" + file.originalname);
    },
  });
  let fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
  ) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    }
    callback(null, false);
  };
  return multer({ storage, fileFilter });
};
