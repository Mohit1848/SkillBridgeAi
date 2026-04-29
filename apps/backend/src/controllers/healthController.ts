import type { RequestHandler } from "express";
import { flags } from "../config/env.js";

export const getHealth: RequestHandler = (_request, response) => {
  response.json({
    ok: true,
    service: "skillbridge-backend",
    integrations: {
      mongoEnabled: flags.mongoEnabled,
      firebaseEnabled: flags.firebaseEnabled
    }
  });
};
