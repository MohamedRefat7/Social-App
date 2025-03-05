import * as dbService from "../../DB/dbService.js";
import { UserModel } from "../../DB/models/user.model.js";
import { emailEmitter } from "../../utils/email/emailEvents.js";
import { hash, compare } from "../../utils/hashing/hash.js";
import { encrypt } from "../../utils/encryption/encryption.js";
import path from "path";
import fs from "fs";
import {
  defaultProfilePictureOnCloud,
  defaultPublicId,
} from "../../DB/models/user.model.js";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js";

export const getProfile = async (req, res, next) => {
  const user = await dbService.findOne({
    model: UserModel,
    filter: { _id: req.user._id },
    populate: [
      {
        path: "viewers.userId",
        select: "userName email image -_id",
      },
    ],
    select: "-_id",
  });
  return res.status(200).json({ success: true, user });
};

//share profile , viewers

export const shareProfile = async (req, res, next) => {
  const { profileId } = req.params;

  let user = undefined;

  if (profileId === req.user._id.toString()) {
    user = req.user;
  } else {
    user = await dbService.findOneAndUpdate({
      model: UserModel,
      filter: { _id: profileId, isDeleted: false },
      data: {
        $push: {
          viewers: {
            userId: req.user._id,
            time: Date.now(),
          },
        },
      },
      select: "userName email image",
    });
  }

  return user
    ? res.status(200).json({ success: true, data: { user } })
    : next(new Error("user not found", { cause: 404 }));
};

export const updateEmail = async (req, res, next) => {
  const { email } = req.body;

  if (await dbService.findOne({ model: UserModel, filter: { email } }))
    return next(new Error("email already exists", { cause: 409 }));

  await dbService.updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { tempEmail: email },
  });

  //event for update email
  emailEmitter.emit(
    "sendEmail",
    req.user.email,
    req.user.userName,
    req.user._id
  );
  emailEmitter.emit("updateEmail", email, req.user.userName, req.user._id);

  return res.status(200).json({ success: true, data: {} });
};

export const resetEmail = async (req, res, next) => {
  const { oldCode, newCode } = req.body;

  if (
    !compare({
      plainText: oldCode,
      hashedPassword: req.user.confirmEmailOTP,
    }) ||
    !compare({ plainText: newCode, hashedPassword: req.user.tempEmailOTP })
  )
    return next(new Error("invalid code", { cause: 400 }));

  const user = await dbService.updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      email: req.user.tempEmail,
      changeCredintials: Date.now(),
      $unset: { tempEmail: "", tempEmailOTP: "", confirmEmailOTP: "" },
    },
  });

  return res.status(200).json({ success: true, data: { user } });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, password, confirmPassword } = req.body;

  if (
    !compare({
      plainText: oldPassword,
      hashedPassword: req.user.password,
    })
  )
    return next(new Error("invalid code", { cause: 400 }));

  const user = await dbService.updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      password: hash({ plainText: password, saltRound: process.env.SALT }),
      changeCredintials: Date.now(),
    },
  });

  return res
    .status(200)
    .json({ success: true, message: "password updated successfully" });
};

export const updateProfile = async (req, res, next) => {
  if (req.body.phoneNumber) {
    const encryptPhone = encrypt({
      plainText: req.body.phoneNumber,
      signature: process.env.ENCRYPTION_SECRET,
    });
    req.body.phoneNumber = encryptPhone;
  }

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: req.body,
    options: { new: true, runValidators: true },
  });

  return res.status(200).json({
    success: true,
    results: { user },
  });
};

export const uploadImageDisk = async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: { _id: req.user._id },
    data: { image: req.file.path },
    options: { new: true },
  });
  return res.status(200).json({ success: true, data: { user } });
};

export const uploadMultipleImageDisk = async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: { _id: req.user._id },
    data: { coverImages: req.files.map((obj) => obj.path) },
    options: { new: true },
  });
  return res.status(200).json({ success: true, data: { user } });
};

export const deleteProfilePicture = async (req, res, next) => {
  const user = await dbService.findById({
    model: UserModel,
    id: { _id: req.user._id },
  });
  const imagePath = path.resolve(".", user.image);
  fs.unlinkSync(imagePath);
  user.image = defaultProfilePicture;
  await user.save();

  return res.status(200).json({ success: true, data: { user } });
};

export const uploadImageOnCloud = async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: { _id: req.user._id },
  });

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Users/${user._id}/ProfilePicture`,
    }
  );

  user.image = { secure_url, public_id };
  await user.save();

  return res.status(200).json({ success: true, data: { user } });
};

export const deleteProfilePictureOnCloud = async (req, res, next) => {
  const user = await dbService.findById({
    model: UserModel,
    id: { _id: req.user._id },
  });

  const results = await cloudinary.uploader.destroy(user.image.public_id);

  if (results.result === "ok") {
    user.image = {
      secure_url: defaultProfilePictureOnCloud,
      public_id: defaultPublicId,
    };
  }

  await user.save();

  return res.status(200).json({ success: true, data: { user } });
};
