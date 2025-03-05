import mongoose, { Schema, model, Types } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 5000,
      trim: true,
      required: function () {
        return this.images?.length ? false : true;
      },
    },
    images: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    customId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model("Post", postSchema);
