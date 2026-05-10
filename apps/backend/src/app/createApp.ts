import cors from "cors";
import express from "express";
import { env } from "../config/env.js";
import { attachAuthUser } from "../middleware/auth.js";
import { registerRoutes } from "../routes/registerRoutes.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin is not allowed by CORS."));
      }
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(attachAuthUser);

  registerRoutes(app);

  return app;
};
