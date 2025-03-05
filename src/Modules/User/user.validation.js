import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const shareProfileSchema = joi
  .object({
    profileId: generalFields.id.required(),
  })
  .required();

export const updateEmailSchema = joi
  .object({
    email: generalFields.email.required(),
  })
  .required();

export const resetEmailSchema = joi
  .object({
    oldCode: generalFields.code.required(),
    newCode: generalFields.code.required(),
  })
  .required();

export const updatePasswordSchema = joi
  .object({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.confirmPassword.required(),
  })
  .required();

export const updateProfileSchema = joi
  .object({
    userName: generalFields.userName,
    gender: generalFields.gender,
    phoneNumber: generalFields.phoneNumber,
    DOB: generalFields.DOB,
  })
  .required();
