import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post(
  "/register",
  validation(authValidation.registerSchema),
  asyncHandler(authService.register)
);
router.post(
  "/login",
  validation(authValidation.loginSchema),
  asyncHandler(authService.login)
);

router.get("/refresh_token", asyncHandler(authService.refresh_token));

router.patch(
  "/verifyEmail",
  validation(authValidation.confirmEmailSchema),
  asyncHandler(authService.confirmEmail)
);

router.patch(
  "/forgetPassword",
  validation(authValidation.forgetPasswordSchema),
  asyncHandler(authService.forgetPassword)
);

router.patch(
  "/resetPassword",
  validation(authValidation.resetPasswordSchema),
  asyncHandler(authService.resetPassword)
);

router.get("/loginWithGmail", asyncHandler(authService.loginWithGmail));

export default router;
