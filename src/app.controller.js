import connectDB from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import postRouter from "./Modules/Post/post.controller.js";
import commentRouter from "./Modules/Comment/comment.controller.js";
import adminRouter from "./Modules/Admin/admin.controller.js";
import { globalErrorHandler } from "./utils/errorHandling/globalErrorHandler.js";
import { notFoundHandler } from "./utils/errorHandling/notFoundHandler.js";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  message: "Too many requests from this IP, please try again after 5 minutes",
});

export const bootstrap = async (app, express) => {
  await connectDB();

  app.use(cors());
  app.use(limiter);
  app.use(helmet());
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  app.get("/", (req, res) => res.send("Hello World!"));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/posts", postRouter);
  app.use("/comments", commentRouter);
  app.use("/admin", adminRouter);

  app.all("*", notFoundHandler);
  app.use(globalErrorHandler);
};
