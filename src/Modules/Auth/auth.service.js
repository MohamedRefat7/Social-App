import { UserModel } from "../../DB/models/user.model.js";
import {
  decodedToken,
  rolesType,
  tokenTypes,
} from "../../middleware/auth.middleware.js";
import { emailEmitter } from "../../utils/email/emailEvents.js";
import { hash, compare } from "../../utils/hashing/hash.js";
import { encrypt } from "../../utils/encryption/encryption.js";
import { generateToken } from "../../utils/tokens/token.js";
import { OAuth2Client } from "google-auth-library";
import * as dbService from "../../DB/dbService.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, phoneNumber } =
    req.body;
  if (await dbService.findOne({ model: UserModel, filter: { email } }))
    return next(new Error("user already exists", { cause: 409 }));
  if (password !== confirmPassword) {
    return next(new Error("passwords do not match", { cause: 400 }));
  }

  //bcrypt
  // const hashedPassword = hash({
  //   plainText: password,
  //   saltRound: process.env.SALT,
  // });

  //crypto
  const encryptPhone = encrypt({
    plainText: phoneNumber,
    signature: process.env.ENCRYPTION_SECRET,
  });
  // CryptoJS.AES.encrypt(phoneNumber, process.env.ENCRYPTION_SECRET).toString();

  const user = await dbService.create({
    model: UserModel,
    data: {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber: encryptPhone,
    },
  });
  //send email
  emailEmitter.emit("sendEmail", email, userName);

  return res
    .status(201)
    .json({ success: true, message: "user created successfully", user });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({ model: UserModel, filter: { email } });

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  if (user.confirmEmail === false) {
    return next(new Error("please activate your account", { cause: 400 }));
  }

  if (!compare({ plainText: password, hashedPassword: user.password }))
    return next(new Error("invalid Password", { cause: 400 }));
  //jwt
  const access_token = generateToken({
    payload: { id: user._id, isloggedin: true },
    signature:
      user.role === rolesType.user
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
  });

  const refresh_token = generateToken({
    payload: { id: user._id, isloggedin: true },
    signature:
      user.role === rolesType.user
        ? process.env.USER_REFRESH_TOKEN
        : process.env.ADMIN_REFRESH_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
  });

  if (user.isDeleted == true) {
    user.isDeleted = false;
    await user.save();
  }
  return res.status(200).json({
    success: true,
    tokens: {
      access_token,
      refresh_token,
    },
  });
};

export const confirmEmail = async (req, res, next) => {
  const { code, email } = req.body;

  const user = await dbService.findOne({ model: UserModel, filter: { email } });
  if (!user) return next(new Error("user not found", { cause: 404 }));

  if (user.confirmEmail === true)
    return next(new Error("email already confirmed", { cause: 400 }));

  if (!compare({ plainText: code, hashedPassword: user.confirmEmailOTP })) {
    return next(new Error("invalid code", { cause: 400 }));
  }
  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: { confirmEmail: true, $unset: { confirmEmailOTP: "" } },
  });

  return res
    .status(200)
    .json({ success: true, message: "email confirmed successfully" });
};

export const refresh_token = async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedToken({
    authorization,
    next,
    tokenType: tokenTypes.refresh,
  });
  //jwt
  const access_token = generateToken({
    payload: { id: user._id, isloggedin: true },
    signature:
      user.role === rolesType.user
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
  });

  const refresh_token = generateToken({
    payload: { id: user._id, isloggedin: true },
    signature:
      user.role === rolesType.user
        ? process.env.USER_REFRESH_TOKEN
        : process.env.ADMIN_REFRESH_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
  });

  return res.status(200).json({
    success: true,
    tokens: {
      access_token,
      refresh_token,
    },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await dbService.findOne({
    model: UserModel,
    filter: { email, isDeleted: false },
  });
  if (!user) return next(new Error("user not found", { cause: 404 }));

  emailEmitter.emit("forgetPassword", email, user.userName);

  return res
    .status(200)
    .json({ success: true, message: "email sent successfully" });
};

export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await dbService.findOne({
    model: UserModel,
    filter: { email, isDeleted: false },
  });
  if (!user) return next(new Error("user not found", { cause: 404 }));

  if (!compare({ plainText: code, hashedPassword: user.forgetPasswordOTP }))
    return next(new Error("invalid Password", { cause: 400 }));
  const hashedPassword = await hash({ plainText: password });
  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: { password: hashedPassword, $unset: { forgetPasswordOTP: "" } },
  });

  return res
    .status(200)
    .json({ success: true, message: "password reset successfully" });
};

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    return ticket.getPayload();
  }

  const { email_verified, email, name, picture } = await verify();

  if (!email_verified) {
    return next(new Error("Email not verified", { cause: 400 }));
  }

  let user = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (user && user.providers === providersType.System) {
    return next(new Error("Invalid login method", { cause: 400 }));
  }

  if (!user) {
    user = await dbService.create({
      model: UserModel,
      data: {
        confirmEmail: email_verified,
        email,
        userName: name,
        image: picture,
        providers: providersType.Gmail,
      },
    });
  }

  const access_token = generateToken({
    payload: { id: user._id, isloggedin: true },
    signature: process.env.USER_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
  });

  const refresh_token = generateToken({
    payload: { id: user._id, isloggedin: true },
    signature: process.env.USER_REFRESH_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
  });

  return res
    .status(200)
    .json({ success: true, results: { access_token, refresh_token } });
};
