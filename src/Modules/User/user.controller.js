import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import * as userServies from "./user.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as userValidation from "./user.validation.js";
import {
  upload,
  fileValidation,
} from "../../utils/file Uploading/multerUpload.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";

const router = Router();

router.get("/profile", authentication(), asyncHandler(userServies.getProfile));

router.get(
  "/profile/:profileId",
  validation(userValidation.shareProfileSchema),
  authentication(),
  asyncHandler(userServies.shareProfile)
);

router.patch(
  "/profile/updateEmail",
  authentication(),
  validation(userValidation.updateEmailSchema),
  asyncHandler(userServies.updateEmail)
);

router.patch(
  "/profile/resetEmail",
  validation(userValidation.resetEmailSchema),
  authentication(),
  asyncHandler(userServies.resetEmail)
);

router.patch(
  "/profile/updatePassword",
  validation(userValidation.updatePasswordSchema),
  authentication(),
  asyncHandler(userServies.updatePassword)
);

router.patch(
  "/profile/updateProfile",
  validation(userValidation.updateProfileSchema),
  authentication(),
  asyncHandler(userServies.updateProfile)
);

router.post(
  "/profilePicture",
  authentication(),
  upload(fileValidation.images, "upload/user").single("image"),
  asyncHandler(userServies.uploadImageDisk)
);

router.post(
  "/multipleImages",
  authentication(),
  upload(fileValidation.images).array("images", 3),
  asyncHandler(userServies.uploadMultipleImageDisk)
);

router.delete(
  "/deleteProfilePicture",
  authentication(),
  upload(fileValidation.images, "upload/user").single("image"),
  asyncHandler(userServies.deleteProfilePicture)
);
/// cloudinary //////
router.post(
  "/uploadOnCloud",
  authentication(),
  uploadCloud().single("image"),
  asyncHandler(userServies.uploadImageOnCloud)
);

router.delete(
  "/deleteProfilePictureOnCloud",
  authentication(),
  uploadCloud().single("image"),
  asyncHandler(userServies.deleteProfilePictureOnCloud)
);
export default router;
