import Joi from "joi";
import { rolesType } from "../../middleware/auth.middleware.js";
import { generalFields } from "../../middleware/validation.middleware.js";

export const registerSchema = Joi.object({
  userName: generalFields.userName.required(),
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
  gender: generalFields.gender.required(),
  phoneNumber: generalFields.phoneNumber.required(),
  role: generalFields.role.valid(rolesType.admin, rolesType.user),
}).required();

export const loginSchema = Joi.object({
  email: generalFields.email.required(),
  password: generalFields.password.required(),
}).required();

export const confirmEmailSchema = Joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
}).required();

export const forgetPasswordSchema = Joi.object({
  email: generalFields.email.required(),
}).required();

export const resetPasswordSchema = Joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
}).required();
