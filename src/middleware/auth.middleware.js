import jwt from "jsonwebtoken";
import { UserModel } from "../DB/models/user.model.js";
import { verifyToken } from "../utils/tokens/token.js";
import { asyncHandler } from "../utils/errorHandling/asyncHandler.js";
import * as dbService from "../DB/dbService.js";

export const rolesType = {
  admin: "admin",
  user: "user",
};

export const genderType = {
  male: "male",
  female: "female",
};

//authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      // return res
      //   .status(401)
      //   .json({ success: false, message: "Authorization token is required" });
      return next(new Error("Authorization token is required", { cause: 401 }));
    }
    const [Bearer, token] = authorization.split(" ");
    let TOKEN_SIGNATURE = undefined;
    switch (Bearer) {
      case "User":
        TOKEN_SIGNATURE = process.env.TOKEN_SECRET_USER;
        break;
      case "Admin":
        TOKEN_SIGNATURE = process.env.TOKEN_SECRET_ADMIN;
        break;
      default:
        break;
    }

    const decoded = verifyToken({ token, signature: TOKEN_SIGNATURE });
    // jwt.verify(token, TOKEN_SIGNATURE);
    if (!decoded) {
      // return res
      //   .status(401)
      //   .json({ success: false, message: "Invalid payload" });
      return next(new Error("Invalid payload", { cause: 401 }));
    }
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      // return res
      //   .status(401)
      //   .json({ success: false, message: "User not found" });
      return next(new Error("User not found", { cause: 401 }));
    }

    if (user.changedAt?.getTime() >= decoded.iat * 1000)
      return next(
        new Error("Token is expired please login again", { cause: 401 })
      );

    if (user.isDeleted == true)
      return next(new Error("Please login again", { cause: 401 }));

    req.user = user;
    next();
  } catch (error) {
    // return res
    //   .status(500)
    //   .json({ success: false, error: error.message, stack: error.stack });
    return next(error);
  }
};

export const allowTo = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You are Unauthorized to perform this action", {
          cause: 403,
        })
      );
    }
    next();
  });
};

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};

export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  next = {},
}) => {
  const [bearer, token] = authorization.split(" ") || [];
  if (!bearer || !token)
    return next(new Error("In-Valid Token", { cause: 401 }));

  let ACCESS_SIGNATURE = undefined;
  let REFRESH_SIGNATURE = undefined;
  switch (bearer) {
    case "Admin":
      ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN;
      REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN;
      break;
    case "User":
      ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN;
      REFRESH_SIGNATURE = process.env.USER_REFRESH_TOKEN;
      break;
    default:
      break;
  }

  const decoded = verifyToken({
    token,
    signature:
      tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE,
  });
  const user = await dbService.findOne({
    model: UserModel,
    filter: { _id: decoded.id, isDeleted: false },
  });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));

  if (user.changeCredintials?.getTime() >= decoded.iat * 1000)
    return next(
      new Error("Token is expired please login again", { cause: 401 })
    );
  return user;
};

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    req.user = await decodedToken({
      authorization,
      tokenType: tokenTypes.access,
      next,
    });
    next();
  });
};
