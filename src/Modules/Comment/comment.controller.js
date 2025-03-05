import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import * as commentServies from "./comment.service.js";
import * as commentValidation from "./comment.validation.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router({ mergeParams: true });

router.post(
  "/createComment",
  authentication(),
  allowTo(["user"]),
  uploadCloud().single("image"),
  validation(commentValidation.createCommentSchema),
  asyncHandler(commentServies.createComment)
);

router.patch(
  "/:commentId",
  authentication(),
  allowTo(["user"]),
  uploadCloud().single("image"),
  validation(commentValidation.updateCommentSchema),
  asyncHandler(commentServies.updateComment)
);

router.patch(
  "/softDelete/:commentId",
  authentication(),
  allowTo(["user", "admin"]),
  validation(commentValidation.softDeleteCommentSchema),
  asyncHandler(commentServies.softDelete)
);

router.get(
  "/",
  authentication(),
  allowTo(["user", "admin"]),
  validation(commentValidation.getAllCommentsSchema),
  asyncHandler(commentServies.getAllComments)
);

router.patch(
  "/like_unlike/:commentId",
  authentication(),
  allowTo(["user"]),
  validation(commentValidation.likeUnlikeCommentSchema),
  asyncHandler(commentServies.likeAndUnlike)
);

router.post(
  "/:commentId",
  authentication(),
  allowTo(["user"]),
  uploadCloud().single("image"),
  validation(commentValidation.addReplySchema),
  asyncHandler(commentServies.addReply)
);

router.delete(
  "/:commentId",
  authentication(),
  allowTo(["user", "Admin"]),
  validation(commentValidation.hardDeletedComment),
  asyncHandler(commentServies.hardDeleteComment)
);

export default router;
