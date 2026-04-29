import type { RequestHandler } from "express";
import { flags } from "../config/env.js";

export const getAuthStatus: RequestHandler = (request, response) => {
  response.json({
    enabled: flags.firebaseEnabled,
    user: request.authUser ?? null
  });
};
