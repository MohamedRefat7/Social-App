import jwt from "jsonwebtoken";

export const generateToken = ({ payload, signature, options = {} }) => {
  return jwt.sign(payload, signature, options, { expiresIn: "1d" });
};

export const verifyToken = ({ token, signature }) => {
  return jwt.verify(token, signature);
};
