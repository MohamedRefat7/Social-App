import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Social Media Application" <${process.env.EMAIL}>`, // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });

  return info.rejected.length === 0 ? true : false;
};

export const subject = {
  verifyEmail: "Verify Email",
  resetPassword: "Reset your password",
  updateEmail: "Update your email",
};
