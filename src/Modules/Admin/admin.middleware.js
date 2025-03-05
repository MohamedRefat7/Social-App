import { UserModel } from "../../DB/models/user.model.js";
import { rolesType } from "../../middleware/auth.middleware.js";
import * as dbservice from "../../DB/dbService.js";
export const changeRoleMiddleware = async (req, res, next) => {
  const allRoles = Object.values(rolesType);

  const userReq = req.user;
  const targetUser = await dbservice.findById({
    model: UserModel,
    id: { _id: req.body.userId },
  });

  // check role
  const userReqRole = userReq.role; // admin
  const targetUserRole = targetUser.role; // user

  const userReqIndex = allRoles.indexOf(userReqRole);
  const targetUserIndex = allRoles.indexOf(targetUserRole);

  const canModify = userReqIndex < targetUserIndex; // true

  if (!canModify) return next(new Error("Unauthorized", { cause: 401 }));

  return next();
};
