import type { NextFunction, Request, Response } from "express";
import { verifyFirebaseToken } from "../services/firebaseAdmin.js";

const parseBearerToken = (header: string | undefined): string => {
  if (!header?.startsWith("Bearer ")) {
    return "";
  }

  return header.slice("Bearer ".length).trim();
};

export const attachAuthUser = async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
  try {
    const token = parseBearerToken(request.headers.authorization);
    request.authUser = token ? await verifyFirebaseToken(token) : null;
    next();
  } catch {
    request.authUser = null;
    next();
  }
};
