import connectDB from "./DB/connectionDB.js";
import globalErrorHandler from "./utils/error handling/globalErrorHandler.js";
import notFoundHandler from "./utils/error handling/notFoundHandler.js";
import authRouter from "./modules/auth.module/auth.controller.js";
import userRouter from "./modules/User/user.controller.js";
import cors from "cors";
import companyRouter from "./modules/Company/company.controller.js";
import jobRouter from "./modules/Job/job.controller.js";
import chatRouter from "./modules/chat/chat.controller.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./graphql/app.graphql.js";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  limit: 50, // limit eacth IP 50 requests per windowMs
});

const bootstrap = async (express, app) => {
  // cors origin
  app.use(cors());

  // // security
  app.use(helmet());

  // limit request
  app.use(limiter);

  app.use(express.json()); // bady parser
  app.use("/uploads", express.static("uploads")); // file uploading

  await connectDB(); // connect to DB

  app.use("/graphql", createHandler({ schema }));

  // public route
  app.get("/", (req, res) => {
    return res.status(200).send("Welcome to Job Search App");
  });

  // routes
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/company", companyRouter);
  app.use("/job", jobRouter);
  app.use("/chat", chatRouter);

  // error handling
  app.use("*", notFoundHandler); // not found handler
  app.use(globalErrorHandler); // global error handler
};

export default bootstrap;
