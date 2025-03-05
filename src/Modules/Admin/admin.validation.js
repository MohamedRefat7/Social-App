import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
import { rolesType } from "../../middleware/auth.middleware.js";

export const changeRoleSchema = joi
  .object({
    userId: joi.custom(isValidObjectId).required(),
    role: joi
      .string()
      .valid(...Object.values(rolesType))
      .required(),
  })
  .required();
