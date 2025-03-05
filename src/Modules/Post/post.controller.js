import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import * as postServies from "./post.service.js";
import * as postValidation from "./post.validation.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";
import { validation } from "../../middleware/validation.middleware.js";
import commentRouter from "../Comment/comment.controller.js";
const router = Router();

router.use("/:postId/comment", commentRouter);

router.post(
  "/createPost",
  authentication(),
  allowTo(["user"]),
  uploadCloud().array("images", 3),
  validation(postValidation.createPostSchema),
  asyncHandler(postServies.createPost)
);

router.patch(
  "/updatePost/:postId",
  authentication(),
  allowTo(["user"]),
  uploadCloud().array("images", 3),
  validation(postValidation.updatePostSchema),
  asyncHandler(postServies.updatePost)
);

router.patch(
  "/softDeletePost/:postId",
  authentication(),
  allowTo(["user", "admin"]),
  validation(postValidation.softDeletePostSchema),
  asyncHandler(postServies.softDeletePost)
);

router.patch(
  "/restorePost/:postId",
  authentication(),
  allowTo(["user", "admin"]),
  validation(postValidation.restorePostSchema),
  asyncHandler(postServies.restorePost)
);

router.get(
  "/getPost/:postId",
  authentication(),
  allowTo(["user", "admin"]),
  validation(postValidation.getPostSchema),
  asyncHandler(postServies.getPost)
);

router.get(
  "/activatePost",
  authentication(),
  allowTo(["user", "admin"]),
  asyncHandler(postServies.activatePost)
);

router.get(
  "/freezePost",
  authentication(),
  allowTo(["user", "admin"]),
  asyncHandler(postServies.freezePost)
);

router.patch(
  "/like_unlike/:postId",
  authentication(),
  allowTo(["user"]),
  validation(postValidation.likeAndUnlikeSchema),
  asyncHandler(postServies.likeAndUnlike)
);

export default router;
