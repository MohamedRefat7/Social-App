import * as dbService from "../../DB/dbService.js";
import { PostModel } from "../../DB/models/post.model.js";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js";
import { CommentModel } from "../../DB/models/comment.model.js";
import { rolesType } from "../../middleware/auth.middleware.js";

export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const post = await dbService.findById({
    model: PostModel,
    id: postId,
  });

  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }
  let image;

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Posts/${post.createdBy}/post/${post.customId}/comments`,
      }
    );

    image = { secure_url, public_id };
  }

  const comment = await dbService.create({
    model: CommentModel,
    data: {
      text,
      image,
      createdBy: req.user._id,
      postId: post._id,
    },
  });

  return res.status(200).json({ success: true, data: { comment } });
};

export const updateComment = async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await dbService.findById({
    model: CommentModel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: comment.postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  if (comment.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Unauthorized", { cause: 401 }));

  let image;
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Posts/${post.createdBy}/post/${post.customId}/comments`,
      }
    );

    image = { secure_url, public_id };

    if (comment.image) {
      await cloudinary.uploader.destroy(comment.image.public_id);
    }
    comment.image = image;
  }

  comment.text = text ? text : comment.text;
  await comment.save();

  return res.status(200).json({ success: true, data: { comment } });
};

export const softDelete = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await dbService.findById({
    model: CommentModel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: comment.postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  const commetOwner = comment.createdBy.toString() === req.user._id.toString();

  const postOwner = post.createdBy.toString() === req.user._id.toString();

  const admin = req.user.role === rolesType.admin;

  if (!(commetOwner || postOwner || admin))
    return next(new Error("Unauthorized", { cause: 401 }));

  comment.isDeleted = true;
  comment.deletedBy = req.user._id;
  await comment.save();

  return res.status(200).json({ success: true, data: { comment } });
};

export const getAllComments = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  const comment = await dbService.find({
    model: CommentModel,
    filter: { postId, isDeleted: false, parentComment: { $exists: false } },
    populate: [{ path: "replies" }],
  });

  return res.status(200).json({ success: true, data: { comment } });
};

export const likeAndUnlike = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await dbService.findOne({
    model: CommentModel,
    filter: { _id: commentId, isDeleted: false },
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const isUserLiked = comment.likes.find(
    (user) => user.toString() === userId.toString()
  );

  if (!isUserLiked) {
    comment.likes.push(userId);
  } else {
    comment.likes = comment.likes.filter(
      (user) => user.toString() !== userId.toString()
    );
  }

  await comment.save();

  return res.status(200).json({ success: true, results: { comment } });
};

export const addReply = async (req, res, next) => {
  const { commentId, postId } = req.params;

  const comment = await dbService.findOne({
    model: CommentModel,
    filter: { _id: commentId, isDeleted: false },
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  let image;
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `posts/${post.createdBy}/posts/${post.customId}/comments/${comment._id}`,
      }
    );
    image = { public_id, secure_url };
  }

  const reply = await dbService.create({
    model: CommentModel,
    data: {
      ...req.body,
      createdBy: req.user._id,
      postId: post._id,
      image,
      parentComment: comment._id,
    },
  });

  return res.status(201).json({ success: true, results: { reply } });
};

export const hardDeleteComment = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await dbService.findById({
    model: CommentModel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbService.findById({
    model: PostModel,
    id: comment.postId,
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  const commentOwner = comment.createdBy.toString() === req.user._id.toString();

  const admin = req.user.role === rolesType.admin;

  const postOwner = post.createdBy.toString() === req.user._id.toString();

  if (!(commentOwner || admin || postOwner))
    return next(new Error("Unauthorized", { cause: 401 }));

  await comment.deleteOne();

  return res.status(201).json({ success: true, message: "comment deleted" });
};
