import { Types } from "mongoose";
import Joi from "joi";
import { rolesType } from "./auth.middleware.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files?.length) {
      data.file = req.file || req.files;
    }
    const results = schema.validate(data, { abortEarly: false });
    if (results.error) {
      const errorMessages = results.error.details.map((obj) => obj.message);
      return next(new Error(errorMessages, { cause: 400 }));
    }
    return next();
  };
};

export const isValidObjectId = (value, helper) => {
  if (Types.ObjectId.isValid(value)) {
    return true;
  }
  return helper.message("receiver must be a valid ObjectId");
};

export const generalFields = {
  firstName: Joi.string().min(3).max(20),
  lastName: Joi.string().min(3).max(20),
  email: Joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/))
    .min(8),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  code: Joi.string().pattern(new RegExp(/^[0-9]{6}$/)),
  id: Joi.string().custom(isValidObjectId),
  gender: Joi.string().valid("male", "female"),
  phoneNumber: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  role: Joi.string().valid(rolesType.admin, rolesType.user),
  DOB: Joi.date().less("now"),
  fileObject: {
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
  },
};
