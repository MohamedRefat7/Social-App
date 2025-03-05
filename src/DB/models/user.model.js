import mongoose, { Schema } from "mongoose";
import { rolesType, genderType } from "../../middleware/auth.middleware.js";
import { Types } from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

// export const defaultProfilePicture = "../../utils/defaultProfilePicture.png"; //DiskStorage

export const defaultProfilePictureOnCloud =
  "https://res.cloudinary.com/dqhnz8lo5/image/upload/v1739734663/Users/67a4a4be9a99ad915dde4d89/ProfilePicture/cukqtendmccbrj7flwht.png";
export const defaultPublicId =
  "Users/67a4a4be9a99ad915dde4d89/ProfilePicture/cukqtendmccbrj7flwht";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    gender: {
      type: String,
      required: [true, "gender is required"],
      enum: Object.values(genderType),
      default: genderType.male,
      message: "gender must be male or female",
      trim: true,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(rolesType),
      default: rolesType.user,
    },

    DOB: {
      type: Date,
    },
    //cloudinary
    image: {
      secure_url: {
        type: String,
        default: defaultProfilePictureOnCloud,
      },
      public_id: {
        type: String,
        default: defaultPublicId,
      },
    },
    //diskStorage
    // image: {
    //   type: String,
    //   default: defaultProfilePicture,
    // },
    // coverImages: [String],
    address: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    changeCredintials: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    confirmEmailOTP: String,
    forgetPasswordOTP: String,
    //embbedded documents
    viewers: [
      {
        userId: { type: Types.ObjectId, ref: "User" },
        time: Date,
      },
    ],
    tempEmail: String,
    tempEmailOTP: String,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hash({ plainText: this.password });
  }
  next();
});

export const UserModel = mongoose.model("User", userSchema);
