import multer, { diskStorage } from "multer";

export const fileValidation = {
  images: ["image/jpeg", "image/png"],
  video: ["video/mp4"],
};

export const uploadCloud = () => {
  const storage = diskStorage({});

  const multerUpload = multer({ storage });
  return multerUpload;
};
