import { Router } from "express";
import * as adminService from "./admin.service.js";
import * as adminValidation from "./admin.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { changeRoleMiddleware } from "./admin.middleware.js";
const router = Router();

// get user + posts

router.get(
  "/",
  authentication(),
  allowTo("admin"),
  asyncHandler(adminService.getUsersAndPosts)
);

router.patch(
  "/role",
  authentication(),
  allowTo(["admin"]),
  validation(adminValidation.changeRoleSchema),
  changeRoleMiddleware,
  asyncHandler(adminService.changeRole)
);

export default router;
