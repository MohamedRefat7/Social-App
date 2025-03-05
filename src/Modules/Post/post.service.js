import { nanoid } from "nanoid";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js";
import * as dbService from "../../DB/dbService.js";
import { PostModel } from "../../DB/models/post.model.js";
import { rolesType } from "../../middleware/auth.middleware.js";

export const createPost = async (req, res, next) => {
  const { content } = req.body;
  const allImages = [];
  let customId;
  if (req.files.length) {
    customId = nanoid(5);
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `Posts/${req.user._id}/post/${customId}`,
        }
      );
      allImages.push({ secure_url, public_id });
    }
  }

  const post = await dbService.create({
    model: PostModel,
    data: {
      content,
      images: allImages,
      createdBy: req.user._id,
      customId,
    },
  });

  return res.status(200).json({ success: true, data: { post } });
};

export const updatePost = async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.params;
  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: postId, createdBy: req.user._id },
  });

  if (!post) return next(new Error("post not found", { cause: 404 }));

  const allImages = [];

  if (req.files.length) {
    for (const file of req.files) {
      for (const file of post.images) {
        await cloudinary.uploader.destroy(file.public_id);
      }

      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `Posts/${req.user._id}/post/${post.customId}`,
        }
      );

      allImages.push({ secure_url, public_id });
    }
    post.images = allImages;
  }

  post.content = content ? content : post.content;
  await post.save();
  return res.status(200).json({ success: true, data: { post } });
};

export const softDeletePost = async (req, res, next) => {
  const { postId } = req.params;
  const post = await dbService.findById({
    model: PostModel,
    id: { _id: postId, createdBy: req.user._id },
  });

  if (!post) return next(new Error("post not found", { cause: 404 }));

  if (
    post.createdBy.toString() === req.user._id.toString() ||
    req.user.role === rolesType.admin
  ) {
    post.isDeleted = true;
    post.deletedBy = req.user._id;
    await post.save();
    return res.status(200).json({ success: true, data: { post } });
  } else {
    return next(
      new Error("You are not allowed to delete this post", { cause: 403 })
    );
  }
};

export const restorePost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbService.findOneAndUpdate({
    model: PostModel,
    id: {
      _id: postId,
      isDeleted: true,
      $or: [{ deletedBy: req.user._id }, { role: rolesType.admin }],
    },
    data: { isDeleted: false, $unset: { deletedBy: "" } },
    options: { new: true },
  });

  if (!post)
    return next(
      new Error("Post not found or you are not authorized to restore it", {
        cause: 404,
      })
    );

  return res.status(200).json({ success: true, data: { post } });
};

export const getPost = async (req, res, next) => {
  const { postId } = req.params;
  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
    populate: [
      {
        path: "createdBy",
        select: "userName image -_id",
      },
      {
        path: "comments",
        select: "text image -_id",
        match: { parentComment: { $exists: false } },
        populate: [
          { path: "createdBy", select: "userName image -_id" },
          {
            path: "replies",
          },
        ],
      },
    ],
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  return res.status(200).json({ success: true, data: { post } });
};

export const activatePost = async (req, res, next) => {
  let posts;
  if (req.user.role === rolesType.admin) {
    posts = await dbService.find({
      model: PostModel,
      filter: { isDeleted: false },
      populate: [{ path: "createdBy", select: "userName image -_id" }],
    });
  } else {
    posts = await dbService.find({
      model: PostModel,
      filter: { isDeleted: false, createdBy: req.user._id },
      populate: [{ path: "createdBy", select: "userName image -_id" }],
    });
  }
  return res.status(200).json({ success: true, data: { posts } });
};

export const freezePost = async (req, res, next) => {
  let posts;
  if (req.user.role === rolesType.admin) {
    posts = await dbService.find({
      model: PostModel,
      filter: { isDeleted: true },
      populate: [{ path: "createdBy", select: "userNmae image -_id" }],
    });
  } else {
    posts = await dbService.find({
      model: PostModel,
      filter: { isDeleted: true, createdBy: req.user.id },
      populate: [{ path: "createdBy", select: "userName image -_id" }],
    });
  }
  return res.status(200).json({ success: true, data: { posts } });
};

export const likeAndUnlike = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await dbService.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("Post Not Found", { cause: 404 }));

  const isUserLiked = post.likes.find(
    (user) => user.toString() === userId.toString()
  );

  if (!isUserLiked) {
    post.likes.push(userId);
  } else {
    post.likes = post.likes.filter(
      (user) => user.toString() !== userId.toString()
    );
  }
  await post.save();

  const populatedUsers = await dbService.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
    populate: [{ path: "likes", select: "userName image -_id" }],
  });

  return res.status(200).json({ success: true, data: { populatedUsers } });
};
