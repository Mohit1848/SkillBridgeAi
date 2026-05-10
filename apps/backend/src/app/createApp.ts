import cors from "cors";
import express from "express";
import { env } from "../config/env.js";
import { attachAuthUser } from "../middleware/auth.js";
import { registerRoutes } from "../routes/registerRoutes.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(attachAuthUser);

  registerRoutes(app);

  return app;
};
