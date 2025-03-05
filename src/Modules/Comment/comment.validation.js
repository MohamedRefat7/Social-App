import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const createCommentSchema = Joi.object({
  text: Joi.string().min(2).max(5000).trim(),
  file: Joi.object(generalFields.fileObject),
  postId: generalFields.id.required(),
}).or("text", "file");

export const updateCommentSchema = Joi.object({
  text: Joi.string().min(2).max(5000),
  file: Joi.object(generalFields.fileObject),
  commentId: generalFields.id.required(),
}).or("text", "file");

export const softDeleteCommentSchema = Joi.object({
  commentId: generalFields.id.required(),
}).required();

export const getAllCommentsSchema = Joi.object({
  postId: generalFields.id.required(),
}).required();

export const likeUnlikeCommentSchema = Joi.object({
  commentId: generalFields.id.required(),
}).required();

export const addReplySchema = Joi.object({
  text: Joi.string().min(2).max(5000),
  file: Joi.object(generalFields.fileObject),
  postId: generalFields.id.required(),
  commentId: generalFields.id.required(),
}).or("text", "file");

export const hardDeletedComment = Joi.object({
  commentId: generalFields.id.required(),
}).required();
