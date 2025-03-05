import { EventEmitter } from "events";
import { sendEmail, subject } from "./sendEmail.js";
import { customAlphabet } from "nanoid";
import { hash } from "../hashing/hash.js";
import { UserModel } from "../../DB/models/user.model.js";
import { template } from "./generateHtml.js";
import * as dbService from "../../DB/dbService.js";

export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async (email, userName, id) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.verifyEmail,
  });
});

emailEmitter.on("forgetPassword", async (email, userName, id) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.resetPassword,
  });
});

emailEmitter.on("updateEmail", async (email, userName, id) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.updateEmail,
  });
});

export const sendCode = async ({
  data = {},
  subjectType = subject.verifyEmail,
}) => {
  const { userName, email, id } = data;
  const otp = customAlphabet("0123456789", 6)();
  const hashOTP = hash({ plainText: otp });
  let updateData = {};
  switch (subjectType) {
    case subject.verifyEmail:
      updateData = { confirmEmailOTP: hashOTP };
      break;
    case subject.resetPassword:
      updateData = { forgetPasswordOTP: hashOTP };
      break;
    case subject.updateEmail:
      updateData = { tempEmailOTP: hashOTP };
      break;
    default:
      break;
  }
  await dbService.updateOne({
    model: UserModel,
    filter: { _id: id },
    data: updateData,
  });

  const isSent = await sendEmail({
    to: email,
    subject: subjectType,
    html: template(otp, userName, subjectType),
  });
};
