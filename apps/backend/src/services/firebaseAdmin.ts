import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { AuthenticatedUser } from "@skillbridge/shared";
import { env, flags } from "../config/env.js";

if (flags.firebaseEnabled && getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey
    })
  });
}

export const verifyFirebaseToken = async (token: string): Promise<AuthenticatedUser | null> => {
  if (!flags.firebaseEnabled || !token) {
    return null;
  }

  const decoded = await getAuth().verifyIdToken(token);

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    name: decoded.name ?? null,
    picture: decoded.picture ?? null
  };
};
