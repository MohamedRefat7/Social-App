import { UserModel } from "../../DB/models/user.model.js";
import { PostModel } from "../../DB/models/post.model.js";
import * as dbservice from "../../DB/dbService.js";
export const getUsersAndPosts = async (req, res, next) => {
  const results = await Promise.all([UserModel.find({}), PostModel.find({})]);

  return res.status(200).json({ success: true, results });
};

export const changeRole = async (req, res, next) => {
  // change role
  const { userId, role } = req.body;

  const user = await dbservice.findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId },
    data: { role },
    options: { new: true },
  });

  return res.status(200).json({ success: true, user });
};
