import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const createPostSchema = joi
  .object({
    content: joi.string().min(2).max(5000).trim(),
    file: joi.array().items(joi.object(generalFields.fileObject)),
  })
  .or("content", "file");

export const updatePostSchema = joi
  .object({
    postId: generalFields.id.required(),
    content: joi.string().min(2).max(5000).trim(),
    file: joi.array().items(joi.object(generalFields.fileObject)),
  })
  .or("content", "file");

export const softDeletePostSchema = joi.object({
  postId: generalFields.id.required(),
});

export const restorePostSchema = joi.object({
  postId: generalFields.id.required(),
});

export const getPostSchema = joi.object({
  postId: generalFields.id.required(),
});

export const likeAndUnlikeSchema = joi.object({
  postId: generalFields.id.required(),
});
