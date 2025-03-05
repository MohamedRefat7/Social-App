import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

export const fileValidation = {
  images: ["image/jpeg", "image/png"],
  video: ["video/mp4"],
};

export const upload = (fileType, folder) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.resolve(".", `${folder}/${req.user._id}`);
      //check if folder exists if not create it
      if (fs.existsSync(folderPath)) {
        return cb(null, folderPath);
      } else {
        fs.mkdirSync(folderPath, { recursive: true });
        const fileName = `${folderPath}/${req.user._id}`;
        return cb(null, fileName);
      }
    },
    filename: (req, file, cb) => {
      cb(null, nanoid() + "_" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!fileType.includes(file.mimetype)) {
      return cb(new Error("invalid file type"), false);
    } else {
      cb(null, true);
    }
  };

  const multerUpload = multer({ storage, fileFilter });
  return multerUpload;
};
