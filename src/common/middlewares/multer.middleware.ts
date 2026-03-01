import multer from "multer";
import { existsSync, mkdirSync } from "node:fs";
export const multerMiddleware = ({ customPath = "general" }) => {
  let storage = multer.diskStorage({
    destination(req, file, callback) {
      const path = `uploads/${customPath}`;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      callback(null, path);
    },
    filename(req, file, callback) {
      callback(null, Date.now() + "_" + file.originalname);
    },
  });
  return multer({ storage });
};
