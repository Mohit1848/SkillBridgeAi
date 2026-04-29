import type { AuthenticatedUser } from "@skillbridge/shared";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser | null;
    }
  }
}

export {};
