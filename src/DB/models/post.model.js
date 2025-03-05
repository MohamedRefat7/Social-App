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

postSchema.query.paginate = async function (page) {
  page = page ? parseInt(page) : 1;
  const limit = 4;
  const skip = (page - 1) * limit;
  const data = await this.skip(skip).limit(limit);
  const itemsCount = await this.countDocuments();
  const pagesCount = Math.ceil(itemsCount / limit);
  const itemsPerPage = data.length;
  const nextPage = page < pagesCount ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;
  return { data, itemsCount, pagesCount, itemsPerPage, nextPage, prevPage };
};

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});

export const PostModel = mongoose.model("Post", postSchema);
